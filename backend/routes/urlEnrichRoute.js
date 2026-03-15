

import express from "express";

const router = express.Router();
// ※ process.env はリクエスト時に取得（import 時点では dotenv 未読込のため）
/**
 * POST /url-enrich
 * body: { locations: ["清水寺", "金閣寺", ...] }
 * Places API で各観光地のWebサイトURLを取得して返す
 * レスポンス: { "清水寺": "https://...", "金閣寺": "https://..." }
 */
router.post("/", async (req, res) => {
  const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const { locations } = req.body;
  console.log("受信したlocations:", locations);
  if (!locations || !Array.isArray(locations) || locations.length === 0) {
    return res.status(400).json({ error: "locations が必要です" });
  }

  if (!GOOGLE_API_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY が未設定のため、ダミーデータを返します");
    return res.json({});
  }

  try {
    const results = await Promise.all(
      locations.map(async (name) => {
        const url = await fetchPlaceWebsite(name, GOOGLE_API_KEY);
        return [name, url];
      })
    );

    // URLが取れたものだけ返す
    const urlMap = Object.fromEntries(results.filter(([, url]) => url));
    res.json(urlMap);
  } catch (err) {
    console.error("URL取得エラー:", err.message);
    res.status(500).json({ error: "URL取得に失敗しました" });
  }
});

/**
 * Places API で観光地名 → 公式WebサイトURLを取得
 */
async function fetchPlaceWebsite(placeName, GOOGLE_API_KEY) {
  try {
    // ① テキスト検索で place_id を取得
    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
      `?input=${encodeURIComponent(placeName)}` +
      `&inputtype=textquery` +
      `&fields=place_id` +
      `&language=ja` +
      `&key=${GOOGLE_API_KEY}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const placeId = searchData.candidates?.[0]?.place_id;
    if (!placeId) return null;

    // ② place_id で詳細情報（website）を取得
    const detailUrl =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}` +
      `&fields=website` +
      `&language=ja` +
      `&key=${GOOGLE_API_KEY}`;

    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    return detailData.result?.website || null;
  } catch (err) {
    console.error(`${placeName} のURL取得失敗:`, err.message);
    return null;
  }
}

export default router;
