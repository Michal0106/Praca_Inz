-- funkcja triggera
CREATE OR REPLACE FUNCTION set_goal_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" := NOW();
  RETURN NEW;
END;
$$;

-- drop trigger
DROP TRIGGER IF EXISTS trg_goal_set_updated_at ON "Goal";

-- trigger ustawiajacy updatedAt przy update celu
CREATE TRIGGER trg_goal_set_updated_at
BEFORE UPDATE ON "Goal"
FOR EACH ROW
EXECUTE FUNCTION set_goal_updated_at();
