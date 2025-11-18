import prisma from "../src/config/database.js";

async function unlinkStrava() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.log("Podaj email użytkownika:");
    console.log("node scripts/unlink-strava.js user@example.com\n");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      email: true,
      stravaId: true,
    },
  });

  if (!user) {
    console.log(`Nie znaleziono użytkownika: ${userEmail}\n`);
    return;
  }

  if (!user.stravaId) {
    console.log(`Użytkownik ${userEmail} nie ma połączonego konta Strava\n`);
    return;
  }

  console.log(`\n Odłączanie Strava od użytkownika: ${userEmail}`);
  console.log(`Strava ID: ${user.stravaId}\n`);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stravaId: null,
      stravaAccessToken: null,
      stravaRefreshToken: null,
      stravaTokenExpiresAt: null,
    },
  });

  console.log("Konto Strava zostało odłączone!\n");
  console.log(
    "Użytkownik może teraz połączyć to konto Strava z innym użytkownikiem.\n",
  );
}

unlinkStrava()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Błąd:", error);
    process.exit(1);
  });
