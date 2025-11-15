# 🎯 START HERE - Training Analytics App

## ⚡ Szybki start (3 kroki)

### 1️⃣ Zainstaluj zależności
```bash
npm run setup
```

### 2️⃣ Uruchom aplikację
```bash
npm start
```

### 3️⃣ Otwórz przeglądarkę
```
http://localhost:3000
```

---

## 📋 Co dalej?

### A. Logowanie przez Strava

1. Kliknij **"Załaduj dane ze Strava"**
2. Zaloguj się na swoje konto Strava
3. Zatwierdź uprawnienia aplikacji
4. Kliknij **"Synchronizuj dane"** w dashboardzie

⚠️ **Ważne**: Zobacz `STRAVA_SCOPE_UPDATE.md` jeśli masz problemy z uprawnieniami

### B. Przeglądaj funkcje

#### 📊 Analizuj
- Rozkład typów aktywności
- Statystyki tygodniowe
- Trendy miesięczne
- Rozkład intensywności

#### 📈 Dane
- Najdłuższy trening
- Najtrudniejszy trening
- Rekordy według typów
- Średnie wartości

#### 🏃 Plan treningowy
- Spersonalizowana rekomendacja
- Szczegółowy harmonogram
- 15 gotowych planów treningowych

---

## 🛠️ Komendy

| Komenda | Opis |
|---------|------|
| `npm run setup` | Instalacja wszystkich zależności |
| `npm start` | Uruchom aplikację (backend + frontend) |
| `npm run dev` | Alias dla `npm start` |
| `npm run dev:backend` | Tylko backend (port 5000) |
| `npm run dev:frontend` | Tylko frontend (port 3000) |
| `npm run prisma:studio` | Przeglądarka bazy danych |

---

## 📁 Dokumentacja

- **README.md** - Pełna dokumentacja projektu
- **QUICKSTART.md** - Szczegółowy przewodnik instalacji
- **STRAVA_SCOPE_UPDATE.md** - Konfiguracja uprawnień Strava

---

## 🔧 Konfiguracja

### Dane Strava (już skonfigurowane!)
```
✅ Client ID: 185513
✅ Client Secret: 8771f8a152b46b3899c86e1987df4c14beb27683
✅ Callback URL: http://localhost:5000/api/auth/strava/callback
```

### PostgreSQL
```bash
# Upewnij się że PostgreSQL jest uruchomiony
brew services start postgresql@14

# Lub sprawdź status
brew services list | grep postgresql
```

---

## ❓ Problemy?

### Backend nie startuje
```bash
# Sprawdź PostgreSQL
psql postgres

# Sprawdź bazę danych
psql training_db

# Reset bazy danych
cd backend
npx prisma migrate reset
npm run prisma:seed
```

### Frontend nie łączy się z backendem
```bash
# Sprawdź czy backend działa
curl http://localhost:5000/api/health

# Powinno zwrócić: {"status":"OK","timestamp":"..."}
```

### Problemy z Strava OAuth
1. Sprawdź `STRAVA_SCOPE_UPDATE.md`
2. Odwołaj dostęp na: https://www.strava.com/settings/apps
3. Zaloguj się ponownie przez aplikację

---

## 🎓 Struktura projektu

```
Praca_Inz/
├── backend/          → Node.js + Express + Prisma
├── frontend/         → React + Vite
├── README.md         → Dokumentacja
├── QUICKSTART.md     → Przewodnik instalacji
└── START_HERE.md     → Ten plik! 👈
```

---

## 🚀 Gotowe do startu?

```bash
npm start
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3000**

---

**Powodzenia! 🎉**

Jeśli masz pytania, sprawdź dokumentację lub logi w terminalu.
