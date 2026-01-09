--DZIALAA
-- usuń wszystkie przeciążenia procedury o tej nazwie
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.prokind = 'p'
      AND n.nspname = 'public'
      AND p.proname = 'create_new_goal'
  LOOP
    EXECUTE format('DROP PROCEDURE IF EXISTS %I.%I(%s);', r.schema_name, r.proname, r.args);
  END LOOP;
END $$;

-- uuid generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- procedura tworzaca nowy cel dla uzytkownika
CREATE OR REPLACE PROCEDURE create_new_goal(
  p_user_id text,
  p_type text,
  p_period text,
  p_target numeric,
  p_window_start timestamp,
  p_window_end timestamp
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "Goal"
  SET "isActive" = false
  WHERE "userId" = p_user_id AND "isActive" = true;

INSERT INTO "Goal" (
  "id",
  "userId",
  "type",
  "period",
  "target",
  "windowStart",
  "windowEnd",
  "isActive",
  "isCompleted",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  p_user_id,
  p_type::"GoalType",
  p_period::"GoalPeriod",
  p_target,
  p_window_start,
  p_window_end,
  true,
  false,
  NOW(),
  NOW()
);

END;
$$;
