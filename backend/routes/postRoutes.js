import express from "express";
import Post from "../models/PostModel.js";

const router = express.Router();

// 投稿一覧取得
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "取得失敗" });
  }
});

// 投稿作成
router.post("/", async (req, res) => {
  try {
    const { userId, userName, planId, title, plan, comment, photos } = req.body;
    const post = new Post({ userId, userName, planId, title, plan, comment, photos });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "投稿失敗" });
  }
});

// コメント追加
router.post("/:id/comments", async (req, res) => {
  console.log(">>> POST /posts 受信:", req.body); // ← 追加
  try {
    const { userId, userName, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "投稿が見つかりません" });
    post.comments.push({ userId, userName, text });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(">>> 保存エラー:", err); // ← 追加
    res.status(500).json({ message: "コメント失敗" });
  }
});

export default router;