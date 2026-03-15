import express from "express"; // require ではなく import
const router = express.Router();

const SUPPORTED_LANGUAGES = ["ja", "en", "zh", "ko"];

/**
 * GET /api/language
 * 現在の言語設定を返す
 */
router.get("/", (req, res) => {
  // セッションがあればそこから、なければ "ja" をデフォルトにする
  // (セッション未設定の場合は常に "ja" が返ります)
  const lang = req.session?.lang ?? "ja";
  res.json({ lang });
});

/**
 * POST /api/language
 * 言語設定を保存する
 */
router.post("/", (req, res) => {
  const { lang } = req.body;

  if (!lang || !SUPPORTED_LANGUAGES.includes(lang)) {
    return res.status(400).json({
      error: "Invalid language code",
      supported: SUPPORTED_LANGUAGES,
    });
  }

  // セッション機能が導入されていれば保存
  if (req.session) {
    req.session.lang = lang;
  }

  res.json({ lang, message: "Language updated successfully" });
});

// module.exports ではなく export default
export default router;