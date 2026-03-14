import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDays, parseISO, format } from "date-fns";

dotenv.config();

const app = express();

// CORS設定
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Gemini AIクライアント
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/generate", async (req, res) => {
  const { prompt, startDate, stayType, nights = 0, time, startLocation, stayLocation } = req.body;

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

    // プロンプト作成
    let richPrompt = `${prompt} についての旅行プランを作成してください。\n\n`;
    richPrompt += `旅行開始日: ${startDate}\n`;
    richPrompt += `旅行タイプ: ${stayType}\n`;
    if (stayType === "宿泊") {
      richPrompt += `宿泊日数: ${nights}\n`;
      if (stayLocation) richPrompt += `宿泊場所: ${stayLocation}（任意）\n`;
    }
    if (startLocation) richPrompt += `出発場所: ${startLocation}（任意）\n`;
    if (time) richPrompt += `出発時間: ${time}（任意）\n`;
    richPrompt += `旅行終了日（宿泊の場合）: ${finalEndDate}\n\n`;
    richPrompt += `【条件】\n`;
    richPrompt += `・現実的な移動時間を考慮する\n`;
    richPrompt += `・時間ごとのスケジュールを書く\n`;
    richPrompt += `・宿泊の場合は宿泊場所も考慮\n\n`;
    richPrompt += `【重要ルール】\n`;
    richPrompt += `回答の最後にルート生成用の訪問地点名を一行で記述してください\n`;
    richPrompt += `例: Locations: [京都駅, 清水寺, 伏見稲荷大社, 京都駅]`;

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