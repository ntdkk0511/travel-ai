import fetch from "node-fetch";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function getPlacePhoto(placeName) {
    try {

        console.log("検索場所:", placeName);

        const searchUrl =
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
            `?input=${encodeURIComponent(placeName)}` +
            `&inputtype=textquery` +
            `&fields=photos,name,place_id` +
            `&language=ja` +
            `&key=${GOOGLE_API_KEY}`;

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        console.log("Googleレスポンス:", JSON.stringify(searchData, null, 2));

        if (!searchData.candidates || searchData.candidates.length === 0) {
            console.log("候補なし");
            return null;
        }

        const place = searchData.candidates[0];

        if (!place.photos || place.photos.length === 0) {
            console.log("写真なし");
            return null;
        }

        const photoRef = place.photos[0].photo_reference;

        const photoUrl =
            `https://maps.googleapis.com/maps/api/place/photo` +
            `?maxwidth=800` +
            `&photo_reference=${photoRef}` +
            `&key=${GOOGLE_API_KEY}`;

        return photoUrl;

    } catch (err) {
        console.error("Photo fetch error:", err);
        return null;
    }
}