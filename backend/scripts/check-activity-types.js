import prisma from "../src/config/database.js";

async function checkActivityTypes() {
  try {
    console.log("=== TYPY AKTYWNOŚCI W BAZIE ===\n");

    // Pobierz unikalne typy aktywności
    const activities = await prisma.activity.findMany({
      select: {
        type: true,
      },
    });

    const typeCounts = {};
    activities.forEach((act) => {
      const type = act.type || "NULL";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    console.log("Znalezione typy aktywności:\n");
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} aktywności`);
      });

    console.log(`\nŁącznie: ${activities.length} aktywności`);

    // Pokaż przykładowe aktywności typu związanego z bieganiem
    console.log("\n=== PRZYKŁADOWE AKTYWNOŚCI BIEGOWE ===\n");
    
    const runActivities = await prisma.activity.findMany({
      where: {
        type: {
          contains: "Run",
          mode: "insensitive",
        },
      },
      take: 5,
      select: {
        name: true,
        type: true,
        startDate: true,
        distance: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    runActivities.forEach((act) => {
      console.log(`${act.name}`);
      console.log(`  Typ: "${act.type}"`);
      console.log(`  Data: ${act.startDate.toLocaleDateString("pl-PL")}`);
      console.log(`  Dystans: ${act.distance ? (act.distance / 1000).toFixed(2) + " km" : "brak"}`);
      console.log();
    });
  } catch (error) {
    console.error("Błąd:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivityTypes();
