import prisma from "../src/config/database.js";

async function clearActivities() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.log("Podaj email użytkownika:");
    console.log("node scripts/clear-activities.js user@example.com\n");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    console.log(`Nie znaleziono użytkownika: ${userEmail}\n`);
    return;
  }

  console.log(`\nUsuwanie aktywności użytkownika: ${user.email}\n`);

  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
  });

  if (activities.length === 0) {
    console.log("Brak aktywności do usunięcia\n");
    return;
  }

  console.log(`Znaleziono ${activities.length} aktywności`);

  console.log("\n1. Usuwanie GPS points...");
  await prisma.gPSPoint.deleteMany({
    where: {
      activityId: { in: activities.map((a) => a.id) },
    },
  });

  console.log("2. Usuwanie Power Curve...");
  await prisma.powerCurve.deleteMany({
    where: {
      activityId: { in: activities.map((a) => a.id) },
    },
  });

  console.log("3. Usuwanie Pace Distances...");
  await prisma.paceDistance.deleteMany({
    where: {
      activityId: { in: activities.map((a) => a.id) },
    },
  });

  console.log("4. Usuwanie Activities...");
  const deleted = await prisma.activity.deleteMany({
    where: { userId: user.id },
  });

  console.log("5. Resetowanie UserStats...");
  await prisma.userStats.update({
    where: { userId: user.id },
    data: {
      totalActivities: 0,
      totalDistance: 0,
      totalDuration: 0,
      totalElevationGain: 0,
    },
  });

  console.log(`\nUsunięto ${deleted.count} aktywności!`);
  console.log(`Możesz teraz przetestować synchronizację od zera\n`);
}

clearActivities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Błąd:", error);
    process.exit(1);
  });
