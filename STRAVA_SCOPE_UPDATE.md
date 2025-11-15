# ⚠️ WAŻNE - Aktualizacja Strava API Scope

## Problem
Obecnie Twój Access Token ma tylko scope `read`, a aplikacja wymaga `activity:read_all` i `profile:read_all`.

## Rozwiązanie

### Krok 1: Zaktualizuj ustawienia aplikacji Strava

1. Przejdź do: https://www.strava.com/settings/api
2. Znajdź swoją aplikację (Client ID: 185513)
3. Upewnij się, że **Authorization Callback Domain** jest ustawiony na: `localhost`

### Krok 2: Usuń poprzednią autoryzację

1. Przejdź do: https://www.strava.com/settings/apps
2. Znajdź swoją aplikację testową
3. Kliknij "Revoke Access" (jeśli istnieje)

### Krok 3: Nowa autoryzacja z poprawnymi uprawnieniami

Po uruchomieniu aplikacji (backend + frontend):

1. Otwórz: http://localhost:3000
2. Kliknij "Załaduj dane ze Strava"
3. System automatycznie poprosi o następujące uprawnienia:
   - ✅ `activity:read_all` - odczyt wszystkich aktywności
   - ✅ `profile:read_all` - odczyt profilu użytkownika

4. Zatwierdź uprawnienia
5. Zostaniesz przekierowany do dashboardu

### Krok 4: Synchronizuj dane

1. W dashboardzie kliknij przycisk **"Synchronizuj dane"**
2. Aplikacja pobierze wszystkie Twoje treningi ze Strava
3. Dane będą dostępne w sekcjach:
   - 📊 Analizuj
   - 📈 Dane
   - 🏃 Plan treningowy

## Alternatywnie: Test bez logowania

Jeśli chcesz tylko przetestować aplikację bez Strava:

1. Możesz manualnie dodać przykładowe dane do bazy
2. Użyj Prisma Studio: `cd backend && npm run prisma:studio`
3. Dodaj użytkownika i przykładowe aktywności

Lub zmodyfikuj aplikację aby działała z testowymi danymi.

## Potwierdzenie poprawnej konfiguracji

Po zalogowaniu przez Strava, sprawdź w konsoli backendu:
```
Powinny pojawić się logi:
- Strava auth callback
- User creation/login
- Session created
```

W dashboardzie powinieneś zobaczyć:
- ✅ Twój email
- ✅ Statystyki (początkowo 0)
- ✅ Przycisk "Synchronizuj dane"

Po synchronizacji:
- ✅ Liczba treningów > 0
- ✅ Lista ostatnich aktywności
- ✅ Wypełnione statystyki (dystans, czas, itp.)
