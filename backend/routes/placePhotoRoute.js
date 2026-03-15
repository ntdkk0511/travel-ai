import express from "express";
import { getPlacePhoto } from "../services/googlePlacePhoto.js";

const router = express.Router();

// 観光地の写真取得
router.post("/photos", async (req, res) => {

    const { locations } = req.body;

    if (!locations || locations.length === 0) {
        return res.status(400).json({ error: "locationsが必要です" });
    }

    try {

        const results = [];

        for (const place of locations) {

            const photo = await getPlacePhoto(place);

            results.push({
                name: place,
                photo
            });

        }

        res.json({
            places: results
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "写真取得失敗" });
    }

});

export default router;