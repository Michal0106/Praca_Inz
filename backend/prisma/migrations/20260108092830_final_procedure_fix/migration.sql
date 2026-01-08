

DROP PROCEDURE IF EXISTS create_new_goal(UUID, TEXT, TEXT, DECIMAL, TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS compute_goal_progress(UUID, UUID);


CREATE OR REPLACE FUNCTION compute_goal_progress(p_user_id TEXT, p_goal_id TEXT)
RETURNS TABLE(
    current_value DECIMAL(10,1),
    target_value DECIMAL(10,1),
    progress_percent INTEGER,
    total_distance_km DECIMAL(10,1),
    total_duration_min DECIMAL(10,1),
    total_elevation_m DECIMAL(10,1),
    total_activities INTEGER
) AS $$
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

    SELECT * INTO v_goal FROM "Goal" WHERE id = p_goal_id::uuid AND "userId" = p_user_id::uuid;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    v_window_start := v_goal."windowStart";
    v_window_end := v_goal."windowEnd";
    v_target := v_goal.target;


    SELECT
        COALESCE(SUM(distance) / 1000, 0)::DECIMAL(10,1),
        COALESCE(SUM(duration) / 60, 0)::DECIMAL(10,1),
        COALESCE(SUM("elevationGain"), 0)::DECIMAL(10,1),
        COUNT(*)::INTEGER
    INTO v_total_distance, v_total_duration, v_total_elevation, v_total_activities
    FROM "Activity"
    WHERE "userId" = p_user_id::uuid
      AND "startDate" >= v_window_start
      AND "startDate" < v_window_end;


    CASE v_goal.type
        WHEN 'DISTANCE_KM' THEN v_current := v_total_distance;
        WHEN 'DURATION_MIN' THEN v_current := v_total_duration;
        WHEN 'ELEVATION_M' THEN v_current := v_total_elevation;
        WHEN 'ACTIVITIES_COUNT' THEN v_current := v_total_activities;
        ELSE v_current := 0;
    END CASE;

    IF v_target > 0 THEN
        v_percent := LEAST(100, FLOOR((v_current / v_target) * 100));
    END IF;

    RETURN QUERY SELECT v_current, v_target, v_percent, v_total_distance, v_total_duration, v_total_elevation, v_total_activities;
END;
$$ LANGUAGE plpgsql;






CREATE OR REPLACE PROCEDURE create_new_goal(
    p_user_id TEXT,
    p_type TEXT,
    p_period TEXT,
    p_target DECIMAL,
    p_window_start TIMESTAMP,
    p_window_end TIMESTAMP
)
AS $$
DECLARE
    v_new_goal_id UUID;
BEGIN
    UPDATE "Goal"
    SET "isActive" = false
    WHERE "userId" = p_user_id::uuid AND "isActive" = true;

    INSERT INTO "Goal" (
        id,
        "userId",
        type,
        period,
        target,
        "isActive",
        "windowStart",
        "windowEnd",
        "isCompleted",
        "completedAt",
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        p_user_id::uuid,
        p_type,
        p_period,
        p_target,
        true,
        p_window_start,
        p_window_end,
        null,
        null,
        NOW(),
        NOW()
    ) RETURNING id INTO v_new_goal_id;

    RAISE NOTICE 'Created new goal % for user %', v_new_goal_id, p_user_id;
END;
$$ LANGUAGE plpgsql;