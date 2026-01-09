CREATE EXTENSION IF NOT EXISTS "pgcrypto";


DROP PROCEDURE IF EXISTS create_new_goal(text, text, text, numeric, timestamp, timestamp);

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
  WHERE "userId" = p_user_id
    AND "isActive" = true;


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
    "createdAt"
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
    NOW()
  );
END;
$$;
