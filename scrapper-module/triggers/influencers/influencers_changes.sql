-- hstore extension needed to compare columns
CREATE EXTENSION IF NOT EXISTS hstore;
-- Create the generic function that sends a notification
CREATE OR REPLACE FUNCTION notify_influencers_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  modified_columns TEXT[] := ARRAY[]::TEXT[];  -- Initialize as an empty array
  uid_value TEXT;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'influencers' THEN
      uid_value := NEW.uid;
    ELSIF TG_TABLE_NAME = 'infs_extra_data' THEN
      uid_value := NEW.key;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'influencers' THEN
      uid_value := OLD.uid;
    ELSIF TG_TABLE_NAME = 'infs_extra_data' THEN
      uid_value := OLD.key;
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
      'uid', uid_value,  -- Return uid from the new row
      'modified_columns', CASE 
                            WHEN array_length(modified_columns, 1) IS NULL THEN '[]'::JSON
                            ELSE to_json(modified_columns) 
                          END  -- Ensure it's always a valid JSON array
    );
  ELSIF TG_OP = 'DELETE' THEN
    payload := json_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'uid', uid_value  -- Return uid from the old row
    );
  END IF;

  -- Send notification
  PERFORM pg_notify('influencers_changes', payload::TEXT);
  
  -- Return the modified row for INSERT/UPDATE, otherwise OLD for DELETE
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
---------------------------------------------------------------------------
-- Create the trigger to listen for changes on the "influencers" table
CREATE TRIGGER trigger_influencers_changes
AFTER INSERT OR UPDATE OR DELETE ON influencers
FOR EACH ROW 
EXECUTE FUNCTION notify_influencers_changes();
-- Create the trigger to listen for changes on the "infs_extra_data" table
CREATE TRIGGER infs_extra_data_changes
AFTER INSERT OR UPDATE OR DELETE
ON infs_extra_data
FOR EACH ROW
EXECUTE FUNCTION notify_influencers_changes();
