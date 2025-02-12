-- hstore extension needed to compare columns
CREATE EXTENSION IF NOT EXISTS hstore;
-- Create the generic function that sends a notification
CREATE OR REPLACE FUNCTION notify_category_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  modified_columns TEXT[] := ARRAY[]::TEXT[];  -- Initialize as an empty array
  id_value TEXT;  
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'category' THEN
      id_value := NEW.id_categ;
    ELSIF TG_TABLE_NAME = 'subcategory' THEN
      id_value := NEW.id_sub_categ;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'category' THEN
      id_value := OLD.id_categ;
    ELSIF TG_TABLE_NAME = 'subcategory' THEN
      id_value := OLD.id_sub_categ;
    END IF;
  END IF;

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
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'id', id_value,
      'modified_columns', CASE 
                            WHEN array_length(modified_columns, 1) IS NULL THEN '[]'::JSON
                            ELSE to_json(modified_columns) 
                          END  -- Ensure it's always a valid JSON array
    );
  ELSIF TG_OP = 'DELETE' THEN
    payload := json_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'id', id_value
    );
  END IF;

  -- Send notification
  PERFORM pg_notify('category_changes', payload::TEXT);
  
  -- Return the modified row for INSERT/UPDATE, otherwise OLD for DELETE
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
---------------------------------------------------------------------------
-- Create the trigger to listen for changes on the "category" table
CREATE TRIGGER trigger_category_changes
AFTER INSERT OR UPDATE OR DELETE ON category
FOR EACH ROW 
EXECUTE FUNCTION notify_category_changes();
-- Create the trigger to listen for changes on the "subcategory" table
CREATE TRIGGER trigger_subcategory_changes
AFTER INSERT OR UPDATE OR DELETE
ON subcategory
FOR EACH ROW
EXECUTE FUNCTION notify_category_changes();