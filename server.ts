import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { DrugItem, ComprehensiveAnalysis } from "./src/types";
import { analyzeInteractionsOffline, ALL_DRUGS_FLAT, searchDrugsLocal } from "./src/data/pharmacologyDb";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let genAIClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "PharmAtlas Clinical API",
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    totalDrugsLoaded: ALL_DRUGS_FLAT.length,
    timestamp: new Date().toISOString(),
  });
});

// Drug search endpoint
app.get("/api/drugs/search", (req: Request, res: Response) => {
  const query = (req.query.q as string) || "";
  const results = searchDrugsLocal(query);
  res.json({ results });
});

// Interaction analysis endpoint
app.post("/api/analyze-interactions", async (req: Request, res: Response) => {
  const { drugs } = req.body as { drugs: DrugItem[] };

  if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
    return res.status(400).json({ error: "Необходимо передать массив препаратов (от 1 до 5)." });
  }

  // Base offline analysis
  const offlineResult = analyzeInteractionsOffline(drugs);

  const ai = getGemini();
  if (!ai || !process.env.GEMINI_API_KEY) {
    // Return offline analysis if API key is not yet set
    return res.json({
      ...offlineResult,
      aiGenerated: false,
    });
  }

  try {
    const drugsDescription = drugs.map((d, i) => 
      `${i + 1}. МНН: ${d.inn} (${d.inn_lat || 'Lat'}), Торговые названия: ${(d.trade_names || []).join(', ')}, Фарм.группа: ${d.group_name}, Механизм: ${d.mechanism_of_action}, Мишени: ${d.profiles_and_targets}`
    ).join("\n");

    const prompt = `Ты — ведущий профессор клинической фармакологии и доказательной медицины.
Проведи глубокий, строго аргументированный анализ взаимодействия и совместимости следующих препаратов (всего ${drugs.length} шт.):

${drugsDescription}

Необходимо сформировать всеобъемлющий анализ с двумя параллельными взглядами:
1. "ДЛЯ ПРОФЕССИОНАЛОВ" (врачи, клинические фармакологи, провизоры): глубокие молекулярные механизмы, рецепторный синергизм/антагонизм, цитохромы CYP450 (CYP3A4, CYP2D6, CYP2C9, CYP1A2, CYP2C19), транспортеры P-gp, влияние на интервал QT, электролиты (K+, Na+), почечный клиренс и СКФ, протоколы мониторинга, критерии коррекции доз и безопасные альтернативы.
2. "ДЛЯ ПОТРЕБИТЕЛЕЙ" (пациенты, обычные люди без медицинского образования): простой, доступный и понятный язык, четкий светофор безопасности, правила приема (время, еда, интервалы между таблетками), "красные флаги" (когда вызывать скорую), совместимость с алкоголем и грейпфрутовым соком, понятные вопросы врачу.

Верни строго валидный JSON следующей структуры:
{
  "overallRisk": "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "SAFE_SYNERGY",
  "riskScore": number (от 0 до 100),
  "summaryHeadline": {
    "professional": "Четкий клинический вердикт для врачей",
    "consumer": "Понятный заголовок простыми словами для пациента"
  },
  "pairwiseCollisions": [
    {
      "drugA": "Препарат 1",
      "drugB": "Препарат 2",
      "groupA": "Группа 1",
      "groupB": "Группа 2",
      "riskLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "SAFE_SYNERGY",
      "interactionType": "Название типа взаимодействия",
      "pharmacodynamics": "Подробный молекулярный и синаптический механизм",
      "pharmacokinetics": "Влияние на метаболизм, CYP, клиренс, связывание с белками",
      "clinicalConsequences": "Клинические риски (аритмия, кровотечение, гипотензия, ОПН)",
      "monitoringProtocol": "Лабораторный и инструментальный контроль (ЭКГ, СКФ, калий, МНО)",
      "doctorRecommendation": "Врачебная тактика и альтернативные препараты",
      "consumerSummary": "Что происходит простыми словами",
      "consumerAction": "Что делать пациенту (как принимать или не принимать)",
      "dangerSigns": ["Симптом 1", "Симптом 2"],
      "foodAndLifestyleTips": "Советы по еде, воде и образу жизни"
    }
  ],
  "polypharmacyWarnings": {
    "professional": ["Врачебные предупреждения о полипрагмазии"],
    "consumer": ["Предупреждения для пациента простым языком"]
  },
  "metabolicCollisions": [
    {
      "enzyme": "Например: CYP3A4 / P-гликопротеин",
      "description": "Описание ферментной индукции/ингибирования",
      "affectedDrugs": ["Препарат А", "Препарат Б"]
    }
  ],
  "vitalOrganImpacts": [
    {
      "organ": "Сердечно-сосудистая система" | "Почки и СКФ" | "Печень и CYP" | "ЦНС и дыхание" | "ЖКТ и гемостаз",
      "status": "safe" | "caution" | "danger",
      "detailsPro": "Профессиональный статус влияния на орган",
      "detailsConsumer": "Простой статус влияния на орган"
    }
  ],
  "monitoringChecklist": ["Пункт контроля 1", "Пункт контроля 2"],
  "actionPlanConsumer": ["Правило приема 1", "Правило приема 2"],
  "questionsForDoctor": ["Вопрос 1", "Вопрос 2"]
}`;

    const aiResult = await analyzeWithGeminiWithFallback(ai, prompt);
    if (aiResult) {
      return res.json({
        ...aiResult,
        aiGenerated: true,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.warn("[PharmAtlas] Analysis fallback triggered to local pharmacology engine");
  }

  // Fallback to offline rule-based analysis if Gemini times out or throws
  return res.json({
    ...offlineResult,
    aiGenerated: false,
  });
});

async function analyzeWithGeminiWithFallback(ai: GoogleGenAI, prompt: string): Promise<ComprehensiveAnalysis | null> {
  const modelsToTry = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-flash-latest"];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (text) {
        const parsedData = JSON.parse(text) as ComprehensiveAnalysis;
        return parsedData;
      }
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const isTransient = errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand");
      
      if (isTransient) {
        // High demand on current model, quickly continue to next fallback model
        continue;
      }
      // For any other unexpected errors, try next model as well
      continue;
    }
  }

  return null;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PharmAtlas] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
