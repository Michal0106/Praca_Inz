import prisma from "../src/config/database.js";

async function showAllData() {
  try {
    console.log("=== WSZYSCY UŻYTKOWNICY ===\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        stravaId: true,
        createdAt: true,
      },
    });

    console.log(`Znaleziono ${users.length} użytkowników:\n`);

    for (const user of users) {
      console.log(`📧 ${user.email}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Strava ID: ${user.stravaId || "niepołączony"}`);
      console.log(`   Utworzony: ${user.createdAt.toLocaleString("pl-PL")}\n`);

      const activityCount = await prisma.activity.count({
        where: { userId: user.id },
      });

      console.log(`   📊 Aktywności: ${activityCount}`);

      if (activityCount > 0) {
        const sampleActivities = await prisma.activity.findMany({
          where: { userId: user.id },
          orderBy: { startDate: "desc" },
          take: 3,
          select: {
            name: true,
            type: true,
            startDate: true,
            distance: true,
          },
        });

        console.log("   Przykłady:");
        sampleActivities.forEach((act) => {
          console.log(
            `     - ${act.name} (${act.type}) - ${act.startDate.toLocaleDateString("pl-PL")} - ${act.distance ? (act.distance / 1000).toFixed(2) + " km" : "brak"}`
          );
        });
      }

      const stats = await prisma.userStats.findUnique({
        where: { userId: user.id },
      });

      if (stats) {
        console.log(`\n   📈 Statystyki:`);
        console.log(`      Total Activities: ${stats.totalActivities}`);
        console.log(
          `      Total Distance: ${(stats.totalDistance / 1000).toFixed(2)} km`
        );
        console.log(`      Last Sync: ${stats.lastSyncDate?.toLocaleString("pl-PL") || "brak"}`);
      }

      console.log("\n" + "=".repeat(60) + "\n");
    }

    const orphanedActivities = await prisma.activity.findMany({
      where: {
        userId: {
          notIn: users.map((u) => u.id),
        },
      },
      take: 5,
    });

    if (orphanedActivities.length > 0) {
      console.log("⚠️  ZNALEZIONO AKTYWNOŚCI BEZ UŻYTKOWNIKA:");
      orphanedActivities.forEach((act) => {
        console.log(`   - ${act.name} (userId: ${act.userId})`);
      });
    }
  } catch (error) {
    console.error("Błąd:", error);
  } finally {
    await prisma.$disconnect();
  }
}

showAllData();
