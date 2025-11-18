import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const code = process.argv[2];

if (!code) {
  console.error(`Brak kodu autoryzacyjnego

Użycie:
 node scripts/getStravaToken.js YOUR_CODE_HERE

Krok po kroku:

1. Otwórz link w przeglądarce:
 https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3001/api/auth/strava/callback&approval_prompt=force&scope=read,activity:read_all,activity:write

2. Kliknij "Authorize"

3. Zostaniesz przekierowany na URL typu:
 http://localhost:3001/api/auth/strava/callback?code=TWÓJ_KOD_TUTAJ&scope=...

4. Skopiuj część po "code=" (do pierwszego &)

5. Uruchom:
 node scripts/getStravaToken.js TWÓJ_KOD_TUTAJ`);
  process.exit(1);
}

console.log("Wymieniam kod na access token...\n");

async function exchangeCode() {
  try {
    const response = await axios.post("https://www.strava.com/oauth/token", {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
    });

    const { access_token, refresh_token, expires_at, athlete } = response.data;

    console.log("SUKCES! Token uzyskany\n");

    console.log(
      `Athlete: ${athlete.firstname} ${athlete.lastname} (ID: ${athlete.id})`,
    );
    console.log(
      `Token wygasa: ${new Date(expires_at * 1000).toLocaleString("pl-PL")}\n`,
    );

    console.log("Access Token (skopiuj do .env):");
    console.log("-".repeat(60));
    console.log(access_token);
    console.log("-".repeat(60));
    console.log("");

    console.log("Refresh Token (na przyszłość):");
    console.log("-".repeat(60));
    console.log(refresh_token);
    console.log("-".repeat(60));
    console.log("");

    console.log("Dodaj do .env:");
    console.log("=".repeat(60));
    console.log(`STRAVA_ACCESS_TOKEN=${access_token}`);
    console.log(`STRAVA_REFRESH_TOKEN=${refresh_token}`);
    console.log("=".repeat(60));
    console.log("");
    console.log("Teraz uruchom:");
    console.log("node scripts/fullStravaSync.js");
    console.log("");
  } catch (error) {
    console.error(
      "Błąd podczas wymiany kodu:",
      error.response?.data || error.message,
    );
    console.error("\nPrawdopodobne przyczyny:");
    console.error("- Kod wygasł (ważny tylko ~10 minut)");
    console.error("- Kod już został użyty");
    console.error("- Nieprawidłowy client_id lub client_secret w .env");
    console.error("\nSpróbuj ponownie uzyskać kod autoryzacyjny.");
  }
}

exchangeCode();
