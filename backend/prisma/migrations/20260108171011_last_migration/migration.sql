--DZIALA
-- drop poprzedniej o takiej nazwie funkcji, jesli istnieje
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.prokind = 'f'
      AND n.nspname = 'public'
      AND p.proname = 'compute_goal_progress'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s);', r.schema_name, r.proname, r.args);
  END LOOP;
END $$;


-- liczenie progresu celu
CREATE OR REPLACE FUNCTION compute_goal_progress(p_user_id TEXT, p_goal_id TEXT)
RETURNS TABLE(
  current_value DECIMAL(10,1),
  target_value  DECIMAL(10,1),
  progress_percent INTEGER,
  total_distance_km DECIMAL(10,1),
  total_duration_min DECIMAL(10,1),
  total_elevation_m DECIMAL(10,1),
  total_activities INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_goal RECORD;
  v_window_start TIMESTAMP;
  v_window_end TIMESTAMP;
  v_total_distance DECIMAL(10,1) := 0;
  v_total_duration DECIMAL(10,1) := 0;
  v_total_elevation DECIMAL(10,1) := 0;
  v_total_activities INTEGER := 0;
  v_current DECIMAL(10,1) := 0;
  v_target DECIMAL(10,1);
  v_percent INTEGER := 0;
BEGIN
  SELECT * INTO v_goal
  FROM "Goal"
  WHERE "id" = p_goal_id
    AND "userId" = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_window_start := v_goal."windowStart";
  v_window_end   := v_goal."windowEnd";
  v_target       := v_goal."target"::DECIMAL(10,1);

  SELECT
    COALESCE(SUM("distance") / 1000, 0)::DECIMAL(10,1),
    COALESCE(SUM("duration") / 60, 0)::DECIMAL(10,1),
    COALESCE(SUM("elevationGain"), 0)::DECIMAL(10,1),
    COUNT(*)::INTEGER
  INTO v_total_distance, v_total_duration, v_total_elevation, v_total_activities
  FROM "Activity"
  WHERE "userId" = p_user_id
    AND "startDate" >= v_window_start
    AND "startDate" <  v_window_end;

  CASE v_goal."type"::TEXT
    WHEN 'DISTANCE_KM'      THEN v_current := v_total_distance;
    WHEN 'DURATION_MIN'     THEN v_current := v_total_duration;
    WHEN 'ELEVATION_M'      THEN v_current := v_total_elevation;
    WHEN 'ACTIVITIES_COUNT' THEN v_current := v_total_activities;
    ELSE v_current := 0;
  END CASE;

  IF v_target > 0 THEN
    v_percent := LEAST(100, FLOOR((v_current / v_target) * 100));
  END IF;

  RETURN QUERY
    SELECT v_current, v_target, v_percent,
           v_total_distance, v_total_duration, v_total_elevation, v_total_activities;
END;
$$;
