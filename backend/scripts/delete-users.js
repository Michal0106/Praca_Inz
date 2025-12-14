import prisma from "../src/config/database.js";

async function deleteAllUsers() {
  try {
    console.log("=== USUWANIE WSZYSTKICH UŻYTKOWNIKÓW ===\n");

    console.log("Usuwam aktywności...");
    const deletedActivities = await prisma.activity.deleteMany({});
    console.log(`✓ Usunięto ${deletedActivities.count} aktywności\n`);

    console.log("Usuwam statystyki użytkowników...");
    const deletedStats = await prisma.userStats.deleteMany({});
    console.log(`✓ Usunięto ${deletedStats.count} statystyk\n`);

    console.log("Usuwam tokeny odświeżania...");
    const deletedTokens = await prisma.refreshToken.deleteMany({});
    console.log(`✓ Usunięto ${deletedTokens.count} tokenów\n`);

    console.log("Usuwam plany treningowe...");
    const deletedPlans = await prisma.trainingPlan.deleteMany({});
    console.log(`✓ Usunięto ${deletedPlans.count} planów treningowych\n`);

    console.log("Usuwam użytkowników...");
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✓ Usunięto ${deletedUsers.count} użytkowników\n`);

    console.log("=== BAZA DANYCH WYCZYSZCZONA ===");
  } catch (error) {
    console.error("Błąd podczas usuwania:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
