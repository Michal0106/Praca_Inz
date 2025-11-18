import prisma from "../src/config/database.js";
import { stravaService } from "../src/services/strava.service.js";
import { calculatePowerCurveForActivity } from "../src/services/charts/powerCurve.service.js";
import { calculatePaceDistanceForActivity } from "../src/services/charts/paceDistance.service.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const STRAVA_API_BASE = "https://www.strava.com/api/v3";

async function getStravaAccessToken() {

  const user = await prisma.user.findFirst({
    where: { stravaId: { not: null } },
  });

  if (!user) {
    throw new Error("No Strava user found in database");
  }

  console.log(`Found user with Strava ID: ${user.stravaId}`);
  console.log(`User ID: ${user.id}`);

  const accessToken = process.env.STRAVA_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(`
 No STRAVA_ACCESS_TOKEN found in .env
 
 To get your access token:
 1. Go to https://www.strava.com/settings/api
 2. Create an app if you haven't
 3. Get your access token
 4. Add to .env: STRAVA_ACCESS_TOKEN=your_token_here
 
 Or use the Strava OAuth flow to authenticate`);
  }

  return { accessToken, userId: user.id };
}

async function getActivityStreams(accessToken, activityId) {
  try {
    const response = await axios.get(
      `${STRAVA_API_BASE}/activities/${activityId}/streams`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          keys: "time,latlng,distance,altitude,velocity_smooth,heartrate,watts,cadence,temp",
          key_by_type: true,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to get streams for activity ${activityId}:`,
      error.message,
    );
    return null;
  }
}

async function syncAllActivities() {
  try {
    const { accessToken, userId } = await getStravaAccessToken();

    console.log("Starting full Strava sync...\n");

    let page = 1;
    let allActivities = [];
    let hasMore = true;

    while (hasMore) {
      console.log(`Fetching page ${page}...`);
      const activities = await stravaService.getActivities(
        accessToken,
        page,
        200,
      );

      if (activities.length === 0) {
        hasMore = false;
      } else {
        allActivities = allActivities.concat(activities);
        console.log(
          `Got ${activities.length} activities (total: ${allActivities.length})`,
        );
        page++;

        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    console.log(`\nTotal activities from Strava: ${allActivities.length}`);
    console.log(
      `Date range: ${new Date(allActivities[allActivities.length - 1]?.start_date).toDateString()} to ${new Date(allActivities[0]?.start_date).toDateString()}\n`,
    );

    let newCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allActivities.length; i++) {
      const activity = allActivities[i];
      const progress = `[${i + 1}/${allActivities.length}]`;

      try {
        const existing = await prisma.activity.findUnique({
          where: {
            externalId_source: {
              externalId: activity.id.toString(),
              source: "STRAVA",
            },
          },
        });

        let dbActivity;

        if (!existing) {
          dbActivity = await prisma.activity.create({
            data: {
              userId,
              externalId: activity.id.toString(),
              source: "STRAVA",
              name: activity.name,
              type: activity.type,
              startDate: new Date(activity.start_date),
              duration: activity.moving_time,
              distance: activity.distance,
              averageHeartRate: activity.average_heartrate,
              maxHeartRate: activity.max_heartrate,
              averageSpeed: activity.average_speed,
              maxSpeed: activity.max_speed,
              elevationGain: activity.total_elevation_gain,
              calories: activity.calories,
              averagePower: activity.average_watts,
              maxPower: activity.max_watts,
              trainingLoad: activity.suffer_score,
            },
          });
          newCount++;
          console.log(
            `${progress} Created: ${activity.name} (${activity.type}, ${new Date(activity.start_date).toDateString()})`,
          );
        } else {
          dbActivity = await prisma.activity.update({
            where: { id: existing.id },
            data: {
              name: activity.name,
              type: activity.type,
              duration: activity.moving_time,
              distance: activity.distance,
              averageHeartRate: activity.average_heartrate,
              maxHeartRate: activity.max_heartrate,
              averageSpeed: activity.average_speed,
              maxSpeed: activity.max_speed,
              elevationGain: activity.total_elevation_gain,
              calories: activity.calories,
              averagePower: activity.average_watts,
              maxPower: activity.max_watts,
              trainingLoad: activity.suffer_score,
            },
          });
          updatedCount++;
          console.log(`${progress} Updated: ${activity.name}`);
        }

        if (activity.map?.summary_polyline) {
          console.log(`Fetching GPS streams...`);
          const streams = await getActivityStreams(accessToken, activity.id);

          if (streams?.latlng?.data && streams.latlng.data.length > 0) {
            await prisma.gpsPoint.deleteMany({
              where: { activityId: dbActivity.id },
            });

            const gpsPoints = streams.latlng.data.map((latlng, idx) => ({
              activityId: dbActivity.id,
              latitude: latlng[0],
              longitude: latlng[1],
              altitude: streams.altitude?.data[idx] || null,
              timestamp: new Date(
                dbActivity.startDate.getTime() +
                  (streams.time?.data[idx] || idx) * 1000,
              ),
              speed: streams.velocity_smooth?.data[idx] || null,
              heartRate: streams.heartrate?.data[idx] || null,
              power: streams.watts?.data[idx] || null,
              cadence: streams.cadence?.data[idx] || null,
            }));

            for (let j = 0; j < gpsPoints.length; j += 1000) {
              const batch = gpsPoints.slice(j, j + 1000);
              await prisma.gpsPoint.createMany({
                data: batch,
                skipDuplicates: true,
              });
            }

            console.log(`Saved ${gpsPoints.length} GPS points`);
          }
        }

        try {
          await calculatePowerCurveForActivity(dbActivity.id, userId);
          console.log(`Power curve calculated`);
        } catch (err) {
          console.log(`Power curve calculation skipped: ${err.message}`);
        }

        if (["Run", "VirtualRun"].includes(dbActivity.type)) {
          try {
            await calculatePaceDistanceForActivity(dbActivity.id, userId);
            console.log(`Pace distance calculated`);
          } catch (err) {
            console.log(`Pace distance calculation skipped: ${err.message}`);
          }
        }

        if (i % 10 === 0 && i > 0) {
          console.log(`\n Pausing for rate limit...\n`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        errorCount++;
        console.error(`${progress} Error: ${activity.name} - ${error.message}`);
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("Sync Complete!");
    console.log(`${"=".repeat(60)}`);
    console.log(`New activities: ${newCount}`);
    console.log(`Updated activities: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total in Strava: ${allActivities.length}`);

    const stats = await prisma.activity.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: {
        distance: true,
        duration: true,
        elevationGain: true,
        calories: true,
      },
    });

    await prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalActivities: stats._count.id,
        totalDistance: stats._sum.distance || 0,
        totalDuration: stats._sum.duration || 0,
        totalElevation: stats._sum.elevationGain || 0,
        totalCalories: stats._sum.calories || 0,
        lastSyncDate: new Date(),
      },
      update: {
        totalActivities: stats._count.id,
        totalDistance: stats._sum.distance || 0,
        totalDuration: stats._sum.duration || 0,
        totalElevation: stats._sum.elevationGain || 0,
        totalCalories: stats._sum.calories || 0,
        lastSyncDate: new Date(),
      },
    });

    console.log("\nUser stats updated");
  } catch (error) {
    console.error("Sync error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAllActivities();
