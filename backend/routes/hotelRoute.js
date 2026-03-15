// hotelRoute.js
// 宿泊地名を受け取り、Google Places APIでホテル一覧（写真・料金）を返すルート

import express from "express";

const hotelRouter = express.Router();

const PRICE_LEVEL_MAP = {
  0: "価格情報なし",
  1: "～¥5,000〜",
  2: "¥5,000〜¥15,000〜",
  3: "¥15,000〜¥30,000〜",
  4: "¥30,000〜",
};

async function fetchHotels(stayLocation) {
  const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // stayLocationの周辺ホテルをテキスト検索
    const query = `${stayLocation} ホテル 旅館`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=lodging&language=ja&key=${GOOGLE_API_KEY}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    console.log(`[HotelRoute] ${stayLocation} → status: ${searchData.status}, 件数: ${searchData.results?.length ?? 0}`);

    if (searchData.status !== "OK" || !searchData.results || searchData.results.length === 0) {
      console.warn(`[HotelRoute] 結果なし (${stayLocation}): ${searchData.status}`);
      return [];
    }

    // 上位5件を返す
    const hotels = searchData.results.slice(0, 5).map((place) => {
      const photoRef = place.photos?.[0]?.photo_reference ?? null;
      const photoUrl = photoRef
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`
        : null;

      return {
        name: place.name,
        address: place.formatted_address ?? null,
        rating: place.rating ?? null,
        priceLevel: place.price_level ?? null,
        priceLabelJa: PRICE_LEVEL_MAP[place.price_level] ?? "価格情報なし",
        photoUrl,
        placeId: place.place_id,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      };
    });

    return hotels;
  } catch (err) {
    console.error(`[HotelRoute] ホテル取得エラー (${stayLocation}):`, err.message);
    return [];
  }
}

hotelRouter.post("/", async (req, res) => {
  const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const { stayLocation } = req.body;

  if (!stayLocation || typeof stayLocation !== "string" || stayLocation.trim() === "") {
    return res.status(400).json({ error: "stayLocation（宿泊地名）が必要です" });
  }

  if (!GOOGLE_API_KEY) {
    console.error("[HotelRoute] GOOGLE_MAPS_API_KEY が未設定です");
    return res.status(500).json({ error: "Google Maps APIキーが設定されていません" });
  }

  console.log(`>>> [ホテル検索開始] 宿泊地: ${stayLocation}`);

  try {
    const hotels = await fetchHotels(stayLocation.trim());
    console.log(`>>> [ホテル検索完了] ${hotels.length}件取得`);
    res.json({ hotels });
  } catch (err) {
    console.error("[HotelRoute] 予期しないエラー:", err.message);
    res.status(500).json({ error: "ホテル情報の取得中にエラーが発生しました" });
  }
});

export default hotelRouter;
