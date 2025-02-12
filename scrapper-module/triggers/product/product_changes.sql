-- hstore extension needed to compare columns
CREATE EXTENSION IF NOT EXISTS hstore;
-- Create the generic function that sends a notification
CREATE OR REPLACE FUNCTION notify_product_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  modified_columns TEXT[] := ARRAY[]::TEXT[];  -- Initialize as an empty array
  column_name TEXT;
  old_value TEXT;
  new_value TEXT;
BEGIN
  -- Detect modified columns for UPDATE
  IF TG_OP = 'UPDATE' THEN
    modified_columns := array(
      SELECT a.key FROM 
      each(hstore(OLD)) a 
      WHERE a.value IS DISTINCT FROM (hstore(NEW))->a.key
    );
  END IF;

  -- Build payload based on the operation type
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    payload := json_build_object(
      'operation', TG_OP,
      'id_product', NEW.id_product,  -- Return id_product from the new row
      'modified_columns', CASE 
                            WHEN array_length(modified_columns, 1) IS NULL THEN '[]'::JSON
                            ELSE to_json(modified_columns) 
                          END  -- Ensure it's always a valid JSON array
    );
  ELSIF TG_OP = 'DELETE' THEN
    payload := json_build_object(
      'operation', TG_OP,
      'id_product', OLD.id_product  -- Return id_product from the old row
    );
  END IF;

  -- Send notification
  PERFORM pg_notify('product_changes', payload::TEXT);
  
  -- Return the modified row for INSERT/UPDATE, otherwise OLD for DELETE
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
---------------------------------------------------------------------------
-- Create the trigger to listen for changes on the "product" table
CREATE TRIGGER trigger_product_changes
AFTER INSERT OR UPDATE OR DELETE ON product
FOR EACH ROW 
EXECUTE FUNCTION notify_product_changes();