# AI Training Plan Generator - Moduł Generowania Planów Treningowych

## Opis funkcjonalności

Moduł do generowania spersonalizowanych planów treningowych wykorzystujący OpenAI GPT-4o i analizę danych ze Strava.

## Wymagania

### Backend
- Node.js 18+ 
- PostgreSQL
- OpenAI API Key

### Zależności
```bash
npm install openai  # już zainstalowane
```

## Konfiguracja

### 1. Klucz API OpenAI

Dodaj swój klucz API OpenAI do pliku `.env`:

```bash
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
```

**Ważne:** Bez prawidłowego klucza API, generowanie planów nie będzie działać. Możesz uzyskać klucz na: https://platform.openai.com/api-keys

### 2. Baza danych

Modele zostały już dodane do schema.prisma i zsynchronizowane z bazą danych.

```prisma
model TrainingPlan {
  id              Int      @id @default(autoincrement())
  userId          Int
  name            String?
  goal            String
  targetRaceDate  DateTime
  weeksCount      Int
  sessionsPerWeek Int
  trainingDays    Json
  status          TrainingPlanStatus @default(ACTIVE)
  analysisData    Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User          @relation(...)
  weeks           PlanWeek[]
}

model PlanWeek {
  id             Int      @id @default(autoincrement())
  planId         Int
  weekNumber     Int
  weekGoal       String?
  totalDistance  Int?
  totalDuration  Int?
  createdAt      DateTime @default(now())
  
  plan           TrainingPlan @relation(...)
  workouts       PlanWorkout[]
}

model PlanWorkout {
  id              Int          @id @default(autoincrement())
  weekId          Int
  dayOfWeek       Int
  workoutType     WorkoutType
  name            String
  description     String       @db.Text
  targetDistance  Int?
  targetDuration  Int?
  targetPace      Int?
  intensity       String?
  intervals       Json?
  completed       Boolean      @default(false)
  completedAt     DateTime?
  actualDistance  Int?
  actualDuration  Int?
  notes           String?
  createdAt       DateTime     @default(now())
  
  week            PlanWeek     @relation(...)
}
```

## Struktura plików

### Backend

```
backend/
├── src/
│   ├── controllers/
│   │   └── trainingPlan.controller.js  # Logika biznesowa (7 endpointów)
│   ├── routes/
│   │   └── trainingPlan.routes.js      # Routing API
│   ├── services/
│   │   └── openai.service.js           # Integracja z OpenAI GPT-4o
│   └── ...
├── prisma/
│   └── schema.prisma                   # Rozszerzony o 3 nowe modele
└── .env                                # Klucz OpenAI tutaj!
```

### Frontend

```
frontend/
└── src/
    ├── pages/
    │   ├── MyTrainingPlansPage.jsx       # Lista planów użytkownika
    │   ├── MyTrainingPlansPage.css
    │   ├── CreateTrainingPlanPage.jsx    # Formularz generowania planu
    │   ├── CreateTrainingPlanPage.css
    │   ├── TrainingPlanDetailPage.jsx    # Szczegóły planu z tygodniami
    │   └── TrainingPlanDetailPage.css
    ├── services/
    │   └── api.js                        # Rozszerzony o trainingPlanAPI
    └── App.jsx                           # Dodane 3 nowe route'y
```

## API Endpoints

### GET `/api/training-plans/analyze`
Analizuje dane treningowe użytkownika z ostatnich 12 tygodni.

**Response:**
```json
{
  "avgWeeklyDistance": 42.5,
  "totalActivities": 48,
  "avgPace": 315,
  "bestEfforts": {
    "best5k": 1234,
    "best10k": 2678
  }
}
```

### POST `/api/training-plans/generate`
Generuje spersonalizowany plan treningowy przy użyciu AI.

**Request Body:**
```json
{
  "goal": "Ukończyć maraton poniżej 4 godzin",
  "targetRaceDate": "2025-09-15",
  "targetRaceDistance": 42195,
  "targetRaceTime": "03:45:00",
  "weeksCount": 16,
  "sessionsPerWeek": 4,
  "trainingDays": [1, 3, 5, 6],
  "currentFitnessLevel": "INTERMEDIATE"
}
```

**Response:**
```json
{
  "trainingPlan": {
    "id": 1,
    "goal": "...",
    "weeks": [
      {
        "weekNumber": 1,
        "weekGoal": "Tydzień adaptacyjny - budowanie bazy",
        "workouts": [
          {
            "dayOfWeek": 1,
            "workoutType": "EASY_RUN",
            "name": "Bieg łatwy",
            "description": "Rozpocznij swój tydzień spokojnym biegiem...",
            "targetDistance": 8000,
            "targetDuration": 2400,
            "targetPace": 300,
            "intensity": "EASY"
          }
        ]
      }
    ]
  }
}
```

### GET `/api/training-plans/my-plans`
Pobiera wszystkie plany użytkownika z zagnieżdżonymi tygodniami i treningami.

### GET `/api/training-plans/my-plans/:planId`
Pobiera szczegóły konkretnego planu.

### PATCH `/api/training-plans/workout/:workoutId/complete`
Oznacza trening jako ukończony.

**Request Body:**
```json
{
  "actualDistance": 10000,
  "actualDuration": 3000,
  "notes": "Świetny trening!"
}
```

### PATCH `/api/training-plans/my-plans/:planId/status`
Zmienia status planu (ACTIVE/COMPLETED/ARCHIVED).

### DELETE `/api/training-plans/my-plans/:planId`
Usuwa plan treningowy (kaskadowo usuwa tygodnie i treningi).

## Routing Frontend

### `/training-plans`
**Component:** `MyTrainingPlansPage`
- Lista wszystkich planów użytkownika
- Status badges (ACTIVE/COMPLETED/ARCHIVED)
- Postęp (ukończone treningi / wszystkie treningi)
- Przycisk "Wygeneruj nowy plan"

### `/training-plans/create`
**Component:** `CreateTrainingPlanPage`
- Analiza aktualnej formy użytkownika (12 tygodni)
- Formularz z preferencjami:
  - Cel treningowy (textarea)
  - Dystans docelowy (select: 5K, 10K, Półmaraton, Maraton)
  - Data biegu (date picker)
  - Docelowy czas (opcjonalny, format HH:MM:SS)
  - Liczba tygodni (slider: 8-24)
  - Treningów w tygodniu (slider: 3-7)
  - Dni treningowe (multi-select: Pn-Nd)
  - Poziom zaawansowania (select: Beginner/Intermediate/Advanced/Elite)
- Walidacja: sessionsPerWeek ≤ trainingDays.length
- Loading state podczas generowania (30-60 sekund)

### `/training-plans/:planId`
**Component:** `TrainingPlanDetailPage`
- Header z nazwą, celem, datą biegu
- Statystyki: tygodnie, treningów/tydzień
- Postęp globalny (progress bar)
- Tygodnie (accordion - rozwijane/zwijane)
- Lista treningów z:
  - Dzień tygodnia
  - Typ treningu
  - Szczegółowy opis (3-4 zdania)
  - Cele: dystans, czas, tempo, intensywność
  - Interwały (jeśli dotyczy)
  - Checkbox "Oznacz jako ukończone"
  - Dane faktyczne po ukończeniu

## Jak to działa

### 1. Analiza danych użytkownika
```javascript
// Backend analizuje ostatnie 12 tygodni aktywności
const analysis = {
  avgWeeklyDistance: calculateAverage(activities),
  totalActivities: activities.length,
  avgPace: calculateAveragePace(activities),
  bestEfforts: extractBestEfforts(activities)
};
```

### 2. Generowanie promptu dla OpenAI
```javascript
// openai.service.js buduje szczegółowy prompt
const prompt = `
Użytkownik przebiegł w ostatnich 12 tygodniach średnio ${avgWeeklyDistance} km...
Najlepszy czas na 5 km: ${best5k}
Za ${weeksCount} tygodni chce pobiec ${targetRaceDistance}m poniżej ${targetRaceTime}

Stwórz plan treningowy w stylu Jack Daniels według zasad:
- Progresywne zwiększanie obciążenia (max 10% tygodniowo)
- Różnorodność treningów (Easy, Tempo, Intervals, Long Run)
- Taper w ostatnich 2-3 tygodniach
- Preferowane dni: ${trainingDays}

Każdy trening musi mieć description z minimum 3-4 zdaniami wyjaśniającymi:
- Jaki jest cel tego treningu
- Jak wpływa na formę
- Na co zwrócić uwagę podczas biegu

Zwróć TYLKO JSON...
`;
```

### 3. GPT-4o generuje plan
```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  temperature: 0.7,
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: "Jesteś ekspertem..." },
    { role: "user", content: prompt }
  ]
});
```

### 4. Zapis do bazy danych
```javascript
// Nested create - plan → weeks → workouts
const plan = await prisma.trainingPlan.create({
  data: {
    userId, goal, targetRaceDate, weeksCount, ...
    weeks: {
      create: generatedPlan.weeks.map(week => ({
        weekNumber, weekGoal, totalDistance,
        workouts: {
          create: week.workouts.map(workout => ({
            dayOfWeek, workoutType, name, description, ...
          }))
        }
      }))
    }
  }
});
```

## Przykład użycia

### 1. Wejdź na stronę "Moje plany"
```
http://localhost:5173/training-plans
```

### 2. Kliknij "Wygeneruj nowy plan"

### 3. Wypełnij formularz:
- **Cel:** "Ukończyć pierwszy maraton"
- **Dystans:** Maraton (42.195 km)
- **Data biegu:** 15.09.2025
- **Czas docelowy:** 04:00:00 (opcjonalnie)
- **Liczba tygodni:** 16
- **Treningów w tygodniu:** 4
- **Dni treningowe:** Pn, Śr, Pt, Sob
- **Poziom:** Intermediate

### 4. Kliknij "Wygeneruj plan"
Czekaj 30-60 sekund - AI tworzy spersonalizowany plan.

### 5. Przeglądaj i realizuj plan
- Rozwiń tygodnie
- Czytaj szczegółowe opisy treningów
- Oznaczaj ukończone treningi
- Śledź postęp

## Testowanie

### Bez klucza OpenAI
Jeśli nie ustawisz `OPENAI_API_KEY`, endpoint `/generate` zwróci błąd:
```json
{
  "error": "OpenAI API key not configured"
}
```

Ale pozostałe funkcje (lista planów, szczegóły, oznaczanie jako ukończone) działają normalnie.

### Z kluczem OpenAI
Po ustawieniu prawidłowego klucza API, pełna funkcjonalność AI jest dostępna.

**Koszt generowania planu:** ~$0.02-0.05 za plan (model GPT-4o)

## Troubleshooting

### Backend nie startuje
```bash
# Sprawdź czy masz klucz OpenAI w .env
cat backend/.env | grep OPENAI

# Jeśli nie ma, dodaj:
echo "OPENAI_API_KEY=your_actual_key_here" >> backend/.env
```

### Generowanie planu zwraca błąd
1. Sprawdź czy klucz API jest prawidłowy
2. Sprawdź czy masz aktywne konto OpenAI z dostępem do GPT-4o
3. Sprawdź logi backend (terminal z npm run dev)
4. Upewnij się że masz zsynchronizowane aktywności ze Strava

### Plan się generuje bardzo długo
To normalne! OpenAI potrzebuje 30-60 sekund na wygenerowanie szczegółowego planu 16-tygodniowego z opisami każdego treningu.

## Przyszłe usprawnienia

- [ ] Cache dla analiz użytkownika (aktualizacja co 24h)
- [ ] Eksport planu do PDF
- [ ] Integracja z kalendarzem Google
- [ ] Powiadomienia o nadchodzących treningach
- [ ] Możliwość edycji wygenerowanego planu
- [ ] Historia zmian w planie
- [ ] Statystyki realizacji planu (adherence rate)
- [ ] Porównanie planów przed i po

## Autor

Moduł stworzony na branch: `training-plan-module`

**Data:** Styczeń 2025
