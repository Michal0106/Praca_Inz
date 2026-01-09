import prisma from "../config/database.js";
import { openaiService } from "../services/openai.service.js";

export async function chatWithAI(req, res) {
  try {
    const userId = req.user?.userId || null;
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    let context = "";
    if (userId) {
      const activities = await prisma.activity.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
        select: { startDate: true, distance: true, duration: true, type: true, avgPaceMinPerKm: true },
      });

      if (!activities || activities.length === 0) {
        const msg = `Nie mam żadnych danych o Twoich aktywnościach w koncie, więc nie mogę bezpiecznie ocenić gotowości do maratonu ani dać spersonalizowanej porady. Aby móc pomóc, podaj proszę jedno z poniższych lub dodaj aktywności do konta:\n\n1) Informacje zdrowotne (czy masz jakieś schorzenia)\n2) Jak często ćwiczysz (ostatnie tygodnie)\n3) Czy masz doświadczenie z półmaratonami lub dłuższymi dystansami\n4) Czy masz obecne dolegliwości lub przeciążenia\n\nJeśli chcesz, możesz też zapytać o ogólne wskazówki jak bezpiecznie wrócić do biegania po przerwie.`;
        return res.json({ reply: msg });
      }

        const recent = activities.slice(0, 25).map((a) => {
        const dkm = a.distance ? (a.distance / 1000).toFixed(1) + "km" : "?km";
        const dur = a.duration ? `${Math.floor(a.duration/60)}m` : "?m";
        const pace = a.avgPaceMinPerKm ? `${a.avgPaceMinPerKm.toFixed(2)} min/km` : "n/a";
        return `${a.type} ${dkm} ${dur} pace:${pace} on ${a.startDate.toISOString().split('T')[0]}`;
      }).join("; ");

      context = `Recent activities: ${recent}\n`;
    } else {
      return res.status(401).json({ error: "Brak autoryzacji" });
    }

    const fullPrompt = `${context}\nUser question: ${prompt}`;

    const reply = await openaiService.chat(fullPrompt, { temperature: 0.7, max_tokens: 700 });

    return res.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return res.status(500).json({ error: error.message || "AI error" });
  }
}

export default {
  chatWithAI,
};
