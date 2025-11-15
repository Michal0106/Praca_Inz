# Szybki Start - Training Analytics App

## Wymagania wstępne

1. **Node.js** (v18 lub nowszy)
   ```bash
   node --version
   ```

2. **PostgreSQL** (v14 lub nowszy)
   ```bash
   psql --version
   ```

3. **Konto Strava Developer**
   - ✅ Już skonfigurowane!
   - Client ID: 185513
   - Authorization Callback Domain: `localhost`

## Instalacja krok po kroku

### 1. Przygotuj bazę danych

```bash
# Uruchom PostgreSQL (jeśli nie jest uruchomiony)
# macOS (Homebrew):
brew services start postgresql@14

# Utwórz bazę danych
createdb training_db

# Sprawdź połączenie
psql training_db
\q
```

### 2. Sklonuj/przejdź do projektu

```bash
cd /Users/michalmroz/Documents/PJATK/Praca_Inz
```

### 3. Instalacja zależności

#### Opcja A: Automatyczna instalacja
```bash
npm run setup
```

#### Opcja B: Manualna instalacja

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 4. Konfiguracja Backend

Edytuj plik `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/training_db?schema=public"
PORT=5000
SESSION_SECRET=super_secret_key_change_this_in_production_min_32_characters

# Wpisz swoje dane ze Strava Developer Panel
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=abcdef123456
STRAVA_CALLBACK_URL=http://localhost:5000/api/auth/strava/callback

CLIENT_URL=http://localhost:3000
```

**Ważne:** Zamień wartości STRAVA_CLIENT_ID i STRAVA_CLIENT_SECRET na prawdziwe dane z Twojego konta Strava.

### 5. Inicjalizacja bazy danych

```bash
cd backend

# Wygeneruj Prisma Client
npm run prisma:generate

# Uruchom migracje
npm run prisma:migrate

# Załaduj dane testowe (15 planów treningowych)
npm run prisma:seed
```

### 6. Uruchomienie aplikacji

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Powinno się wyświetlić:
```
Server is running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Powinno się wyświetlić:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

### 7. Pierwsze użycie

1. Otwórz przeglądarkę: http://localhost:3000
2. Kliknij "Załaduj dane ze Strava"
3. Zaloguj się na swoje konto Strava
4. Autoryzuj aplikację
5. Zostaniesz przekierowany do dashboardu
6. Kliknij "Synchronizuj dane" aby pobrać aktywności
7. Przejdź do sekcji "Analizuj", "Dane" lub "Plan treningowy"

## Rozwiązywanie problemów

### Problem: Błąd połączenia z bazą danych

```bash
# Sprawdź czy PostgreSQL działa
brew services list

# Uruchom jeśli nie działa
brew services start postgresql@14

# Sprawdź czy baza istnieje
psql -l | grep training_db

# Utwórz jeśli nie istnieje
createdb training_db
```

### Problem: Błąd Prisma

```bash
cd backend
rm -rf node_modules
npm install
npm run prisma:generate
npm run prisma:migrate
```

### Problem: Port zajęty

Jeśli port 5000 lub 3000 jest zajęty:

**Backend (zmień w `backend/.env`):**
```env
PORT=5001
```

**Frontend (zmień w `frontend/vite.config.js`):**
```js
server: {
  port: 3001
}
```

### Problem: Strava OAuth nie działa

1. Sprawdź czy callback URL w Strava settings to: `localhost` (bez http://)
2. Sprawdź czy w `.env` masz poprawny STRAVA_CALLBACK_URL
3. Sprawdź czy Client ID i Secret są poprawne
4. Wyczyść cookies i spróbuj ponownie

## Przydatne komendy

```bash
# Otwórz Prisma Studio (GUI do bazy danych)
cd backend
npm run prisma:studio

# Reset bazy danych
cd backend
npx prisma migrate reset

# Zobacz logi backendu
cd backend
npm run dev

# Build produkcyjny
cd frontend
npm run build

cd backend
npm run start
```

## Następne kroki

Po uruchomieniu aplikacji:

1. **Dashboard** - Zobacz swoje statystyki
2. **Analizuj** - Sprawdź wykresy i analizy
3. **Dane** - Zobacz rekordy i średnie
4. **Plan treningowy** - Otrzymaj spersonalizowany plan

## Pomoc

Jeśli masz problemy:
1. Sprawdź sekcję "Rozwiązywanie problemów" powyżej
2. Sprawdź logi w konsoli (backend i frontend)
3. Sprawdź czy wszystkie zależności są zainstalowane
4. Upewnij się że PostgreSQL działa
5. Zweryfikuj dane w pliku `.env`
