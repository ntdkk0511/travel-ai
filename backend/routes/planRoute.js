import express from "express";
import { savePlan, getPlansByUser, deletePlan } from "../controllers/planController.js";

const planRouter = express.Router();

// POST /plans        → プランを保存
planRouter.post("/", savePlan);

// GET  /plans/:userId → ユーザーのプラン一覧を取得
planRouter.get("/:userId", getPlansByUser);

// DELETE /plans/:planId → プランを削除
planRouter.delete("/:planId", deletePlan);

export default planRouter;