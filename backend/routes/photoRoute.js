// photoRoute.js
// 観光地名リストを受け取り、Google Places APIで写真URLを返すルート

import express from "express";

const photoRouter = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * 場所名 → Place ID → 写真URL を取得するヘルパー
 */
async function fetchPlacePhoto(placeName) {
    try {
        // Step 1: テキスト検索でPlace IDと写真リファレンスを取得
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=place_id,name,photos,formatted_address&key=${GOOGLE_API_KEY}`;

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (
            searchData.status !== "OK" ||
            !searchData.candidates ||
            searchData.candidates.length === 0
        ) {
            return { name: placeName, photoUrl: null, address: null };
        }

        const candidate = searchData.candidates[0];
        const address = candidate.formatted_address || null;

        if (!candidate.photos || candidate.photos.length === 0) {
            return { name: placeName, photoUrl: null, address };
        }

        // Step 2: 写真リファレンスから画像URLを生成
        const photoRef = candidate.photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;

        return { name: placeName, photoUrl, address };
    } catch (err) {
        console.error(`写真取得エラー (${placeName}):`, err.message);
        return { name: placeName, photoUrl: null, address: null };
    }
}

/**
 * POST /api/photos
 * Body: { locations: ["京都駅", "清水寺", ...] }
 * Response: { photos: [{ name, photoUrl, address }, ...] }
 */
photoRouter.post("/", async (req, res) => {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
        return res.status(400).json({ error: "locationsの配列が必要です" });
    }

    if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: "Google Maps APIキーが設定されていません" });
    }

    console.log(`>>> [写真取得] ${locations.length}件の場所を処理中...`);

    try {
        // 並列で全場所の写真を取得
        const photos = await Promise.all(locations.map(fetchPlacePhoto));
        console.log(`>>> [写真取得完了] ${photos.filter((p) => p.photoUrl).length}件成功`);
        res.json({ photos });
    } catch (err) {
        console.error("写真取得エラー:", err.message);
        res.status(500).json({ error: "写真の取得中にエラーが発生しました" });
    }
});

export default photoRouter;