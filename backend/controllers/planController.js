import PlanModel from "../models/PlanModel.js";

// プランを保存する
export const savePlan = (req, res) => {
  const { userId, title, plan, startDate, endDate, nights, stayLocation } = req.body;

  if (!userId || !plan || !startDate) {
    return res.status(400).json({ error: "必須項目が不足しています（userId, plan, startDate）" });
  }

  try {
    const newPlan = PlanModel.createPlan(
      userId,
      title || "無題のプラン",
      plan,
      startDate,
      endDate || startDate,
      nights || 0,
      stayLocation || ""
    );
    return res.status(201).json(newPlan);
  } catch (err) {
    console.error("プラン保存エラー:", err);
    return res.status(500).json({ error: "プランの保存に失敗しました" });
  }
};

// ユーザーのプラン一覧を取得する
export const getPlansByUser = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userIdが必要です" });
  }

  try {
    const plans = PlanModel.getPlansByUserId(userId);
    return res.json(plans);
  } catch (err) {
    console.error("プラン取得エラー:", err);
    return res.status(500).json({ error: "プランの取得に失敗しました" });
  }
};

// プランを削除する
export const deletePlan = (req, res) => {
  const { planId } = req.params;

  try {
    const target = PlanModel.getPlanById(planId);
    if (!target) {
      return res.status(404).json({ error: "プランが見つかりません" });
    }
    PlanModel.deletePlanById(planId);
    return res.json({ message: "削除しました" });
  } catch (err) {
    console.error("プラン削除エラー:", err);
    return res.status(500).json({ error: "削除に失敗しました" });
  }
};