import prisma from "../src/config/database.js";

async function showStravaConnections() {
  const userEmail = process.argv[2];

  if (userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        stravaId: true,
        createdAt: true,
        userStats: {
          select: {
            totalActivities: true,
            totalDistance: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`Nie znaleziono użytkownika: ${userEmail}`);
      return;
    }

    console.log("\n Szczegóły użytkownika:\n");
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user.id}`);
    console.log(`Strava ID: ${user.stravaId || "(brak)"}`);
    console.log(`Status: ${user.stravaId ? " Połączony" : " Niepołączony"}`);
    console.log(`Utworzony: ${user.createdAt}`);
    console.log(`Aktywności: ${user.userStats?.totalActivities || 0}`);
    console.log(
      `Dystans: ${((user.userStats?.totalDistance || 0) / 1000).toFixed(1)} km\n`,
    );
  } else {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        stravaId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("\n Wszystkie użytkownicy:\n");
    console.log("".repeat(80));
    console.log(
      "Email".padEnd(30) +
        "Strava ID".padEnd(20) +
        "Status".padEnd(15) +
        "Utworzony",
    );
    console.log("".repeat(80));

    users.forEach((user) => {
      const status = user.stravaId ? " Połączony" : " Niepołączony";
      console.log(
        user.email.padEnd(30) +
          (user.stravaId || "-").padEnd(20) +
          status.padEnd(15) +
          user.createdAt.toISOString().split("T")[0],
      );
    });

    console.log("".repeat(80));
    console.log(`\nŁącznie: ${users.length} użytkowników`);
    console.log(
      `Połączonych ze Stravą: ${users.filter((u) => u.stravaId).length}\n`,
    );

    console.log("Aby zobaczyć szczegóły użytkownika:");
    console.log("node scripts/show-strava-connections.js user@example.com\n");
  }
}

showStravaConnections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Błąd:", error);
    process.exit(1);
  });
