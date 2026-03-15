// photoRoute.js
// 観光地名リストを受け取り、Google Places APIで写真URLを返すルート

import express from "express";

const photoRouter = express.Router();

// GOOGLE_API_KEY は定数にせず、各関数内で process.env から取得する
// （ESModuleではimport時に評価されるため、dotenv.config()より先に実行されてしまうのを防ぐ）

async function fetchPlacePhoto(placeName) {
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    try {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&language=ja&key=${GOOGLE_API_KEY}`;

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        console.log(`[Places API] ${placeName} → status: ${searchData.status}`);

        if (searchData.status !== "OK" || !searchData.results || searchData.results.length === 0) {
            console.warn(`[Places API] 結果なし (${placeName}): ${searchData.status} ${searchData.error_message || ""}`);
            return { name: placeName, photoUrl: null, address: null };
        }

        const place = searchData.results[0];
        const address = place.formatted_address || null;

        if (!place.photos || place.photos.length === 0) {
            console.warn(`[Places API] 写真なし (${placeName})`);
            return { name: placeName, photoUrl: null, address };
        }

        const photoRef = place.photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;

        return { name: placeName, photoUrl, address };
    } catch (err) {
        console.error(`写真取得エラー (${placeName}):`, err.message);
        return { name: placeName, photoUrl: null, address: null };
    }
}

photoRouter.post("/", async (req, res) => {
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
        return res.status(400).json({ error: "locationsの配列が必要です" });
    }

    if (!GOOGLE_API_KEY) {
        console.error("[photoRoute] GOOGLE_MAPS_API_KEY が未設定です");
        return res.status(500).json({ error: "Google Maps APIキーが設定されていません" });
    }

    console.log(`>>> [写真取得開始] ${locations.length}件: ${locations.join(", ")}`);

    try {
        const photos = await Promise.all(locations.map(fetchPlacePhoto));
        const successCount = photos.filter((p) => p.photoUrl).length;
        console.log(`>>> [写真取得完了] ${successCount}/${photos.length}件成功`);
        res.json({ photos });
    } catch (err) {
        console.error("[photoRoute] 予期しないエラー:", err.message);
        res.status(500).json({ error: "写真の取得中にエラーが発生しました" });
    }
});

export default photoRouter;