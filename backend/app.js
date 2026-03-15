import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDays, parseISO, format } from "date-fns";
import UserRoutes from "./routes/UserRoute.js";
import authRoutes from "./routes/AuthRoute.js";
import languageRouter from "./routes/language.js";
//写真追加
import photoRouter from "./routes/photoRoute.js";


//URL下
import urlEnrichRoutes from "./routes/urlEnrichRoute.js";

//プラン保存
import planRouter from "./routes/planRoute.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/users", UserRoutes);
app.use("/api/language", languageRouter);
app.use("/api/photos", photoRouter);

//URL下
app.use("/url-enrich", urlEnrichRoutes);

//プラン保存
app.use("/plans", planRouter);

// Gemini AIクライアント
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// 言語コードを自然言語の指示文に変換
const LANG_INSTRUCTIONS = {
  ja: "必ず日本語のみで回答してください。他の言語を使わないでください。",
  en: "You MUST respond in English only. Do not use any other language.",
  zh: "你必须只用中文回答。请勿使用其他语言。整个回答都必须是中文。",
  ko: "반드시 한국어로만 답변해 주세요. 다른 언어를 사용하지 마세요. 전체 답변을 한국어로 작성하세요.",
};

app.post("/generate", async (req, res) => {
  const { prompt, startDate, stayType, nights = 0, time, startLocation, stayLocation, lang = "ja" } = req.body;

  // 必須チェック
  if (!startDate || !stayType) {
    return res.status(400).json({ error: "必須項目が入力されていません（出発日・日帰り/宿泊）" });
  }

  if (stayType === "宿泊" && (!nights || nights < 1)) {
    return res.status(400).json({ error: "宿泊の場合、宿泊日数は1以上で指定してください" });
  }

  console.log(">>> [開始] リクエストを受信しました");
  console.log(`旅行内容: ${prompt}`);
  console.log(`日帰り/宿泊: ${stayType}`);
  console.log(`出発日: ${startDate}`);
  console.log(`言語: ${lang}`);
  if (startLocation) console.log(`出発場所: ${startLocation}`);
  if (time) console.log(`出発時間: ${time}`);
  if (stayType === "宿泊") {
    console.log(`宿泊日数: ${nights}`);
    if (stayLocation) console.log(`宿泊場所: ${stayLocation}`);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const finalEndDate = stayType === "日帰り"
      ? startDate
      : format(addDays(parseISO(startDate), nights), "yyyy-MM-dd");

    // 言語指示（未知のコードは日本語にフォールバック）
    const langInstruction = LANG_INSTRUCTIONS[lang] ?? LANG_INSTRUCTIONS.ja;

    // プロンプト作成（指示はすべて英語でGeminiに渡す＝日本語混入を防ぐ）
    let richPrompt = `${langInstruction}\n\n`;
    richPrompt += `Create a travel plan for: ${prompt}\n\n`;
    richPrompt += `Trip start date: ${startDate}\n`;
    richPrompt += `Trip type: ${stayType}\n`;
    if (stayType === "宿泊") {
      richPrompt += `Number of nights: ${nights}\n`;
      if (stayLocation) richPrompt += `Stay location: ${stayLocation} (optional)\n`;
    }
    if (startLocation) richPrompt += `Departure location: ${startLocation} (optional)\n`;
    if (time) richPrompt += `Departure time: ${time} (optional)\n`;
    richPrompt += `Trip end date: ${finalEndDate}\n\n`;
    richPrompt += `[Conditions]\n`;
    richPrompt += `- Consider realistic travel times\n`;
    richPrompt += `- Write a schedule by time\n`;
    richPrompt += `- For overnight trips, consider the accommodation\n\n`;
    richPrompt += `[Critical Rule - Route Data]\n`;
    richPrompt += `At the very end of your response, add ONE line in this exact format:\n`;
    richPrompt += `Locations: [place1, place2, place3]\n`;
    richPrompt += `IMPORTANT: The place names inside Locations:[...] MUST be written in Japanese (e.g. 京都駅, 清水寺). This is required for the map API.\n\n`;
    richPrompt += `[Language Rule - Highest Priority]\n`;
    richPrompt += `${langInstruction} Apply this to all text EXCEPT the Locations:[...] line.`;

    console.log(">>> [通信中] Gemini 2.5 APIに接続しています...");
    const result = await model.generateContent(richPrompt);
    const response = await result.response;
    const text = response.text();

    console.log(">>> [完了] 生成に成功しました！");
    res.json({
      plan: text,
      startDate,
      endDate: finalEndDate,
      nights,
      stayLocation: stayLocation || ""
    });

  } catch (err) {
    console.error("--- [エラー発生] ---");
    console.error("Status:", err.status);
    console.error("Message:", err.message);

    if (err.status === 404) return res.status(404).json({ error: "指定したモデルが見つかりません。" });
    if (err.message && err.message.includes("429")) return res.status(429).json({ error: "制限を超えました。少し待ってください。" });

    res.status(500).json({ error: "サーバー内部エラー" });
  }
});

// サーバー起動
app.listen(3000, () => {
  console.log("-----------------------------------------");
  console.log("Server running on http://localhost:3000");
  console.log("Using Model: gemini-2.5-flash");
  console.log("-----------------------------------------");
});

export default app;