import prisma from "../src/config/database.js";

async function checkActivities() {
  const userEmail = process.argv[2] || "mmroz656@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, email: true },
  });

  if (!user) {
    console.log(`Nie znaleziono użytkownika: ${userEmail}\n`);
    return;
  }

  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      type: true,
      distance: true,
      duration: true,
      elevationGain: true,
      startDate: true,
    },
    orderBy: { startDate: "desc" },
    take: 10,
  });

  console.log(`\n Aktywności użytkownika: ${user.email}\n`);
  console.log(`Łącznie aktywności: ${activities.length}\n`);

  if (activities.length > 0) {
    console.log("Ostatnie 10 aktywności:");
    console.log("".repeat(100));

    activities.forEach((a, i) => {
      console.log(`${i + 1}. ${a.name}`);
      console.log(
        `Typ: ${a.type}, Dystans: ${(a.distance / 1000).toFixed(2)} km, Czas: ${Math.floor(a.duration / 60)} min`,
      );
      console.log(`Data: ${a.startDate.toISOString().split("T")[0]}`);
      console.log();
    });

    const allActivities = await prisma.activity.findMany({
      where: { userId: user.id },
      select: {
        distance: true,
        duration: true,
        elevationGain: true,
      },
    });

    const stats = {
      totalActivities: allActivities.length,
      totalDistance: allActivities.reduce(
        (sum, a) => sum + (a.distance || 0),
        0,
      ),
      totalDuration: allActivities.reduce(
        (sum, a) => sum + (a.duration || 0),
        0,
      ),
      totalElevationGain: allActivities.reduce(
        (sum, a) => sum + (a.elevationGain || 0),
        0,
      ),
    };

    console.log("".repeat(100));
    console.log("\n Statystyki (policzone):");
    console.log(`Liczba treningów: ${stats.totalActivities}`);
    console.log(`Dystans: ${(stats.totalDistance / 1000).toFixed(1)} km`);
    console.log(
      `Czas: ${Math.floor(stats.totalDuration / 3600)} h ${Math.floor((stats.totalDuration % 3600) / 60)} min`,
    );
    console.log(`Przewyższenie: ${stats.totalElevationGain.toFixed(0)} m\n`);

    const userStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    });

    if (userStats) {
      console.log("UserStats w bazie:");
      console.log(`Liczba treningów: ${userStats.totalActivities}`);
      console.log(`Dystans: ${(userStats.totalDistance / 1000).toFixed(1)} km`);
      console.log(
        `Czas: ${Math.floor(userStats.totalDuration / 3600)} h ${Math.floor((userStats.totalDuration % 3600) / 60)} min`,
      );
      console.log(
        `Przewyższenie: ${userStats.totalElevationGain.toFixed(0)} m\n`,
      );

      if (userStats.totalActivities !== stats.totalActivities) {
        console.log(
          "UWAGA: UserStats są nieaktualne! Uruchom updateUserStats.\n",
        );
      }
    } else {
      console.log("Brak UserStats w bazie!\n");
    }
  } else {
    console.log("Brak aktywności w bazie\n");
  }
}

checkActivities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Błąd:", error);
    process.exit(1);
  });
