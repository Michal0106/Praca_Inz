import OpenAI from "openai";
import fs from "fs";

const ollamaClient = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', 
});

const MODEL_NAME = 'qwen2.5:7b';

class OpenAIService {
  async generateTrainingPlan(userAnalysis, preferences, onProgress = null) {
    try {
      const prompt = this.buildPrompt(userAnalysis, preferences);

      console.log('[Ollama] Generating training plan with Qwen2.5...');
      console.log('[Ollama] This may take several minutes for a full plan...');

      if (onProgress) onProgress(45, 'AI rozpoczyna generowanie planu...');

      const stream = await ollamaClient.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: `You are an elite world-class running coach with deep expertise in all major endurance training systems, including Jack Daniels, Renato Canova, Patrick Sang, Arthur Lydiard, Stephen Seiler, Pfitzinger, Magness, Canaday, Hudson, Bowerman, Ingebrigtsen methodology and modern sports science. You always select the most effective combination of these systems depending on the user's exact race distance, fitness level, timeline, goal time and historical workload. You must always prioritize safe, progressive, evidence-based training.

You ALWAYS generate output STRICTLY following the JSON rules below:

            STRICT JSON RULES — NEVER BREAK:
            1. Output ONLY valid JSON — start with { and end with }.
            2. NO markdown, NO code blocks, NO commentary outside JSON.
            3. NO newline characters (\\n) inside any string — replace with single spaces.
            4. NO tab characters (\\t) — only spaces.
            5. Descriptions: maximum 1–2 sentences, single line.
            6. All property names MUST be in double quotes.
            7. All string values MUST be in double quotes.
            8. No trailing commas before } or ].
            9. Escape quotes inside strings using \\"
            10. ALL TEXT in the JSON MUST be in Polish.

            TRAINING STRUCTURE RULES — ALWAYS APPLY:
            - Generate a COMPLETE plan with ALL requested weeks.
            - Each week MUST have EXACTLY the number of workouts requested.
            - Every workout MUST include:
            "title"
            "description"
            "targetDistance" (km, number; only 0 on REST)
            "targetDuration" (minutes; only 0 on REST)
            "targetPace" ("M:SS/km" or null for REST)
            "workoutType"
            "intensity"
            "intervals"

            WORKOUT INTERVAL RULES:
            - For ANY non-REST workout, "intervals" MUST be an object containing:
                "warmup"
                "mainSet"
                "cooldown"
            - For INTERVALS workouts, also include:
                "intervals" (e.g. "5x1000m w tempie X")
                "recovery"

            REST DAY RULES:
            - workoutType = "REST"
            - targetDistance = 0
            - targetDuration = 0
            - targetPace = null
            - intervals = null

            PACE AND DURATION RULES:
            - targetPace must be "M:SS/km" format.
            - targetDistance must match training content.
            - targetDuration must match targetDistance and targetPace logically.

            TRAINING METHODOLOGY SELECTION:
            - You MUST internally evaluate the user’s goal, pace, volume history, timeline and choose the optimal hybrid method (e.g., Daniels for structured intensities, Canova for marathon specific endurance, Lydiard for aerobic base, Seiler for polarized distribution, Sang for elite endurance development, Ingebrigtsen for threshold-focused progression).
            - Always combine methods intelligently and safely for the user’s needs.

            The final answer MUST be ONLY the JSON object.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        stream: true, 
      });

      let content = '';
      let lastProgress = 45;
      let chunkCount = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        content += delta;
        chunkCount++;

        if (chunkCount % 5 === 0 && onProgress) {
          const estimatedProgress = Math.min(85, 45 + Math.floor((content.length / 10000) * 40));
          if (estimatedProgress > lastProgress) {
            lastProgress = estimatedProgress;
            onProgress(estimatedProgress, `AI generuje plan... (${Math.floor(content.length / 1000)}KB)`);
          }
        }
      }

      if (onProgress) onProgress(85, 'AI zakończył generowanie, przetwarzanie...');
      console.log('[Ollama] Response received, parsing JSON...');
      
      console.log('[Ollama] Raw response length:', content.length);
      
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        content = codeBlockMatch[1];
        console.log('[Ollama] Extracted from markdown code block');
      }
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
      
      console.log('[Ollama] Extracted JSON preview:', content.substring(0, 300));
      
      let planData;
      try {
        planData = JSON.parse(content);
      } catch (parseError) {
        console.error('[Ollama] JSON parse error:', parseError.message);
        console.error('[Ollama] Problematic content around error:');
        
        if (parseError.message.includes('position')) {
          const match = parseError.message.match(/position (\d+)/);
          if (match) {
            const pos = parseInt(match[1]);
            const start = Math.max(0, pos - 200);
            const end = Math.min(content.length, pos + 200);
            console.error('---CONTEXT START---');
            console.error(content.substring(start, end));
            console.error(' '.repeat(Math.min(200, pos - start)) + '^');
            console.error('---CONTEXT END---');
          }
        }
        
        console.log('[Ollama] Attempting to fix JSON...');
        
        let fixedContent = content;
        
        fixedContent = fixedContent.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
        
        fixedContent = fixedContent.replace(/: "([^"]*)\n([^"]*?)"/g, (match, p1, p2) => {
          return `: "${p1} ${p2}"`;
        });
        
        fixedContent = fixedContent.replace(/,(\s*[}\]])/g, '$1');
        
        fixedContent = fixedContent.replace(/}(\s*){/g, '},\n{');
        
        const debugPath = '/tmp/ollama_invalid_json.txt';
        try {
          fs.writeFileSync(debugPath, `ORIGINAL:\n${content}\n\n\nFIXED:\n${fixedContent}`);
          console.log(`[Ollama] Saved invalid JSON to ${debugPath} for debugging`);
        } catch (e) {
        }
        
        try {
          planData = JSON.parse(fixedContent);
          console.log('[Ollama] Successfully parsed after fixing!');
        } catch (retryError) {
          console.error('[Ollama] Still failed after attempted fix');
          console.error('[Ollama] Retry error:', retryError.message);
          
          if (retryError.message.includes('position')) {
            const match = retryError.message.match(/position (\d+)/);
            if (match) {
              const pos = parseInt(match[1]);
              const start = Math.max(0, pos - 100);
              const end = Math.min(fixedContent.length, pos + 100);
              console.error('---FIXED CONTEXT START---');
              console.error(fixedContent.substring(start, end));
              console.error(' '.repeat(Math.min(100, pos - start)) + '^');
              console.error('---FIXED CONTEXT END---');
            }
          }
          
          throw new Error('Failed to parse JSON from Ollama response: ' + parseError.message);
        }
      }
      
      console.log('[Ollama] Training plan generated successfully');
      console.log('[Ollama] Plan name:', planData.planName);
      console.log('[Ollama] Weeks count:', planData.weeks?.length);
      
      if (planData.weeks && planData.weeks[0] && planData.weeks[0].workouts && planData.weeks[0].workouts[0]) {
        console.log('[Ollama] Sample workout data:', JSON.stringify(planData.weeks[0].workouts[0], null, 2));
      }
      
      return planData;
    } catch (error) {
      console.error("Ollama API error:", error);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          'Ollama is not running. Please start Ollama with: ollama serve\n' +
          'Then make sure you have the model installed: ollama pull qwen2.5'
        );
      }
      
      throw new Error("Failed to generate training plan: " + error.message);
    }
  }

  buildPrompt(userAnalysis, preferences) {
    const {
      avgWeeklyDistance,
      best5kTime,
      best10kTime,
      bestHalfMarathonTime,
      recentWeeksCount,
      avgPace,
      totalActivities,
    } = userAnalysis;

    const {
      goal,
      targetRaceDate,
      weeksCount,
      sessionsPerWeek,
      trainingDays,
      currentFitnessLevel,
      targetRaceDistance,
      targetRaceTime,
    } = preferences;

    const trainingDaysStr = trainingDays
      .map((day) => {
        const days = [
          "Poniedziałek",
          "Wtorek",
          "Środa",
          "Czwartek",
          "Piątek",
          "Sobota",
          "Niedziela",
        ];
        return days[day - 1];
      })
      .join(", ");

    return `
ANALIZA UŻYTKOWNIKA:
Średni tygodniowy kilometraż z ostatnich ${recentWeeksCount} tygodni: ${avgWeeklyDistance.toFixed(1)} km.
Łączna liczba treningów: ${totalActivities}.
Średnie tempo: ${avgPace || "brak danych"}.
${best5kTime ? `Najlepszy czas na 5 km: ${this.formatTime(best5kTime)}.` : ""}
${best10kTime ? `Najlepszy czas na 10 km: ${this.formatTime(best10kTime)}.` : ""}
${bestHalfMarathonTime ? `Najlepszy czas na półmaraton: ${this.formatTime(bestHalfMarathonTime)}.` : ""}

CEL:
${goal}.
Dystans docelowy: ${targetRaceDistance}.
Cel czasowy: ${targetRaceTime || "brak"}.
${targetRaceDate ? `Data zawodów: ${new Date(targetRaceDate).toLocaleDateString("pl-PL")}.` : ""}
Obecny poziom: ${currentFitnessLevel}.

PREFERENCJE:
Plan: ${weeksCount} tygodni.
Treningi tygodniowo: ${sessionsPerWeek}.
Preferowane dni treningowe: ${trainingDaysStr}.

ZADANIE:
Wygeneruj kompletny ${weeksCount}-tygodniowy plan treningowy biegania z dokładnie ${sessionsPerWeek} treningami na tydzień.

CRITICAL: Użyj DOKŁADNIE tej struktury JSON z angielskimi nazwami pól:
To jest przykład struktury JSON, którą MUSISZ wygenerować. Każde pole MUSI być obecne zgodnie z poniższym wzorem, ale plan jest przykladowy i MUSI być dostosowany do analizy użytkownika i preferencji.
{
  "planName": "Nazwa planu treningowego",
  "planDescription": "Krótki opis strategii planu",
  "weeks": [
    {
      "weekNumber": 1,
      "weekGoal": "Cel tygodnia (np. 'Tydzień bazowy')",
      "totalDistance": 30.0,
      "totalDuration": 180,
      "workouts": [
        {
          "dayOfWeek": 1,
          "workoutType": "EASY_RUN",
          "name": "Bieg regeneracyjny",
          "description": "Opis treningu po polsku",
          "targetDistance": 8.0,
          "targetDuration": 48,
          "targetPace": "6:00/km",
          "intensity": "Easy",
          "intervals": null
        },
        {
          "dayOfWeek": 3,
          "workoutType": "INTERVALS",
          "name": "Interwały 5x1000m",
          "description": "Opis treningu",
          "targetDistance": 10.0,
          "targetDuration": 60,
          "targetPace": "4:30/km",
          "intensity": "Hard",
          "intervals": {
            "warmup": "2km w tempie easy",
            "intervals": "5x1000m w tempie 4:30/km",
            "recovery": "400m trucht między interwałami",
            "cooldown": "2km w tempie easy"
          }
        }
      ]
    }
  ]
}

WAŻNE REGUŁY:
1. Nazwy pól MUSZĄ być po angielsku: "planName", "weeks", "workouts", "dayOfWeek", etc.
2. Wartości tekstowe (name, description) MUSZĄ być po polsku
3. workoutType: EASY_RUN, LONG_RUN, TEMPO_RUN, INTERVALS, FARTLEK, RECOVERY, RACE_PACE, REST
4. intensity: Easy, Moderate, Hard, Very Hard
5. targetDistance w kilometrach (np. 8.0, 10.5, 15.0) - nigdy 0 chyba że REST
6. targetDuration w minutach (np. 45, 60, 90) - nigdy 0 lub 1 chyba że REST
7. targetPace format: "X:XX/km" (np. "5:30/km", "6:00/km")

KRYTYCZNE - OBLICZANIE CZASU:
- targetDuration MUSI być obliczony jako: targetDistance (km) × pace (min/km)
- Przykład: 10km × 5:30/km = 10 × 5.5 = 55 minut
- Przykład: 4.5km × 4:15/km = 4.5 × 4.25 = 19 minut (NIE 37!)
- ZAWSZE sprawdź matematykę: dystans × tempo = czas

KRYTYCZNE - TRENINGI INTERWAŁOWE:
- Dla workoutType: "INTERVALS" ZAWSZE dodaj obiekt "intervals"
- "intervals" MUSI zawierać: warmup, intervals, recovery, cooldown
- W polu "name" umieść dokładną specyfikację (np. "Interwały 5x1000m", "Interwały 8x400m")
- W polu "intervals.intervals" podaj DOKŁADNIE tę samą specyfikację co w "name"
- Przykład:
  {
    "name": "Interwały 2x800m",
    "workoutType": "INTERVALS",
    "intervals": {
      "warmup": "2km w tempie easy",
      "intervals": "2x800m w tempie 4:15/km",
      "recovery": "400m trucht między powtórkami",
      "cooldown": "1.5km w tempie easy"
    }
  }

OPISY TRENINGÓW:
- description MUSI być dokładny i kompletny
- Dla interwałów: opisz rozgrzewkę, główną część, przerwy i wyciszenie
- Dla biegów długich: opisz tempo, nawodnienie, progresję
- Dla tempo run: opisz strefę tętna, tempo docelowe
- Użyj fachowej terminologii biegowej po polsku

Wygeneruj WSZYSTKIE ${weeksCount} tygodnie, każdy z ${sessionsPerWeek} treningami.

Zwróć TYLKO JSON, bez komentarzy.
`;
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
}

export const openaiService = new OpenAIService();
