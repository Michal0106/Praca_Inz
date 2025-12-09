import prisma from "../src/config/database.js";

async function checkUsers() {
  try {
    console.log("=== UŻYTKOWNICY W BAZIE ===\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        stravaId: true,
        createdAt: true,
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });

    console.log(`Znaleziono ${users.length} użytkowników:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Imię: ${user.firstName || "brak"} ${user.lastName || ""}`);
      console.log(`   Strava ID: ${user.stravaId || "niepołączony"}`);
      console.log(`   Aktywności: ${user._count.activities}`);
      console.log(`   Utworzony: ${user.createdAt.toLocaleString("pl-PL")}`);
      console.log("");
    });

    // Sprawdź kilka przykładowych aktywności
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n=== PRZYKŁADOWE AKTYWNOŚCI (${firstUser.email}) ===\n`);

      const activities = await prisma.activity.findMany({
        where: { userId: firstUser.id },
        select: {
          id: true,
          name: true,
          type: true,
          startDate: true,
          distance: true,
        },
        orderBy: { startDate: "desc" },
        take: 10,
      });

      console.log(`Znaleziono ${activities.length} aktywności (pokazuję max 10 ostatnich):\n`);

      activities.forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.name}`);
        console.log(`   Typ: ${activity.type}`);
        console.log(`   Data: ${activity.startDate.toLocaleString("pl-PL")}`);
        console.log(`   Dystans: ${activity.distance ? (activity.distance / 1000).toFixed(2) + " km" : "brak"}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("Błąd:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
