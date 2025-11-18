import prisma from "../src/config/database.js";

async function checkTokens() {
  const userEmail = process.argv[2] || "mmroz656@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      email: true,
      stravaId: true,
      stravaAccessToken: true,
      stravaRefreshToken: true,
      stravaTokenExpiresAt: true,
    },
  });

  if (!user) {
    console.log(`Nie znaleziono użytkownika: ${userEmail}\n`);
    return;
  }

  console.log("\nTokemy Strava:\n");
  console.log(`Email: ${user.email}`);
  console.log(`Strava ID: ${user.stravaId || "(brak)"}`);
  console.log(
    `Access Token: ${user.stravaAccessToken ? user.stravaAccessToken.substring(0, 20) + "..." : "(brak)"}`,
  );
  console.log(
    `Refresh Token: ${user.stravaRefreshToken ? user.stravaRefreshToken.substring(0, 20) + "..." : "(brak)"}`,
  );
  console.log(`Expires At: ${user.stravaTokenExpiresAt || "(brak)"}`);

  if (user.stravaTokenExpiresAt) {
    const now = new Date();
    const expired = user.stravaTokenExpiresAt < now;
    console.log(`Status: ${expired ? "Wygasł" : "Ważny"}`);
  }

  console.log();
}

checkTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Błąd:", error);
    process.exit(1);
  });
