import express from "express";
import { refinePlan } from "../controllers/refinePlanController.js";

const refinePlanRouter = express.Router();

// POST /refine-plan → 追加要望を踏まえてプランを再生成
refinePlanRouter.post("/", refinePlan);

export default refinePlanRouter;