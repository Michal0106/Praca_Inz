import prisma from "../config/database.js";
import { getWindow } from "../utils/goalWindow.js";

function round1(x) {
  return Math.round(x * 10) / 10;
}

export async function computeGoalProgress(userId, goal) {
  // SQL
  const results = await prisma.$queryRaw`
    SELECT * FROM compute_goal_progress(${userId}, ${goal.id})
  `;

  if (!results || results.length === 0) {
    throw new Error('Failed to compute goal progress');
  }

  const row = results[0];
  const current = Number(row.current_value);
  const target = Number(row.target_value);
  const percent = Number(row.progress_percent);

  let unit = "";
  switch (goal.type) {
    case "DISTANCE_KM":
      unit = "km";
      break;
    case "DURATION_MIN":
      unit = "min";
      break;
    case "ELEVATION_M":
      unit = "m";
      break;
    case "ACTIVITIES_COUNT":
      unit = "treningów";
      break;
    default:
      unit = "";
  }

  return {
    current: round1(current),
    target: round1(target),
    unit,
    percent,
    windowStart: goal.windowStart,
    windowEnd: goal.windowEnd,
    totals: {
      totalDistanceKm: round1(Number(row.total_distance_km)),
      totalDurationMin: round1(Number(row.total_duration_min)),
      totalElevationM: round1(Number(row.total_elevation_m)),
      totalActivities: Number(row.total_activities),
    },
  };
}

export async function closeExpiredGoalIfNeeded(userId, goal) {
  const now = new Date();
  if (!goal.isActive) return goal;

  if (now >= goal.windowEnd) {
    const progress = await computeGoalProgress(userId, goal);
    const isCompleted = progress.current >= progress.target;

    return prisma.goal.update({
      where: { id: goal.id },
      data: {
        isActive: false,
        isCompleted,
        completedAt: new Date(),
      },
    });
  }

  return goal;
}

export async function createNewGoal(userId, { type, period, target }) {
  const now = new Date();
  const { windowStart, windowEnd } = getWindow(period, now);

  // SQL
await prisma.$executeRaw`
  CALL create_new_goal(
    ${userId}::text,
    ${type}::text,
    ${period}::text,
    ${target}::decimal,
    ${windowStart}::timestamp,
    ${windowEnd}::timestamp
  )
`;


  // nowy goal
  const goal = await prisma.goal.findFirst({
    where: {
      userId,
      isActive: true,
      type,
      period,
      //target,
      //windowStart,
      //windowEnd,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!goal) {
    throw new Error('Failed to create new goal');
  }

  return goal;
}
