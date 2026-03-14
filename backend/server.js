import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios"; // ★追加：APIリクエスト用

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // ReactのURL
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- ★追加：Google Maps APIキーの定義 ---
const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY; 

// --- ★追加：ロッカー検索エンドポイント ---
app.post("/search-lockers", async (req, res) => {
  const { locationName } = req.body;
  try {
    // 1. 地名から座標を取得
    const geoRes = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: { address: locationName, key: GOOGLE_MAPS_API_KEY }
    });

    if (!geoRes.data.results.length) {
      return res.status(404).json({ error: "場所が見つかりませんでした" });
    }

    const { lat, lng } = geoRes.data.results[0].geometry.location;

    // 2. 周辺のロッカーを検索
    const placesRes = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
      params: {
        location: `${lat},${lng}`,
        radius: 1000,
        keyword: "coin locker luggage storage",
        language: "ja",
        key: GOOGLE_MAPS_API_KEY
      }
    });

    res.json({
      lockers: placesRes.data.results.map(p => ({
        id: p.place_id,
        name: p.name,
        location: p.geometry.location
      }))
    });
  } catch (err) {
    console.error("ロッカー検索エラー:", err.message);
    res.status(500).json({ error: "ロッカー情報の取得に失敗しました" });
  }
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  console.log(`>>> [開始] リクエストを受信しました: "${prompt}"`);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- ここからプロンプトの加工 ---
    const richPrompt = `
      ${prompt} についての旅行プランを作成してください。
      
      【重要ルール】
      回答の最後に、ルートを生成するために訪問する具体的な地点名（観光地名や駅名）を
      必ず以下の形式で一行で記述してください。
      記述例： Locations: [京都駅, 清水寺, 伏見稲荷大社, 京都駅]
    `;
    // ------------------------------

    console.log(">>> [通信中] Gemini 2.5 APIに接続しています...");
    
    // 加工した richPrompt を渡す
    const result = await model.generateContent(richPrompt);
    
    console.log(">>> [解析中] AIからの応答を解析しています...");
    const response = await result.response;
    const text = response.text();

    console.log(">>> [完了] 生成に成功しました！");
    res.json({ plan: text });
  } catch (err) {
    console.error("--- [エラー発生] ---");
    console.error("Status:", err.status);
    console.error("Message:", err.message);

    // 404が出た場合は、モデル名がまだ合っていない可能性があります
    if (err.status === 404) {
      return res.status(404).json({ error: "指定したモデルが見つかりません。モデル名を更新してください。" });
    }

    if (err.message && err.message.includes("429")) {
      return res.status(429).json({ error: "制限を超えました。少し待ってください。" });
    }
    res.status(500).json({ error: "サーバー内部エラー" });
  }
});

app.listen(3000, () => {
  console.log("-----------------------------------------");
  console.log("Server running on http://localhost:3000");
  console.log("Using Model: gemini-2.5-flash");
  console.log("-----------------------------------------");
});