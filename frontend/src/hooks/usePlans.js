import { useState, useCallback } from "react";

const API_BASE = "http://localhost:3000";

export function usePlans(userId) {
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // プランを保存する
  const savePlan = useCallback(
    async ({ title, plan, startDate, endDate, nights, stayLocation }) => {
      if (!userId) return;
      setSaving(true);
      setSaveSuccess(false);
      try {
        const res = await fetch(`${API_BASE}/api/plans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, title, plan, startDate, endDate, nights, stayLocation }),
        });
        if (res.ok) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000); // 3秒後にリセット
        }
      } catch (err) {
        console.error("保存エラー:", err);
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  // ユーザーのプラン一覧を取得する
  const fetchPlans = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/plans/${userId}`);
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("取得エラー:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // プランを削除する
  const deletePlan = useCallback(async (planId) => {
    try {
      await fetch(`${API_BASE}/api/plans/${planId}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err) {
      console.error("削除エラー:", err);
    }
  }, []);

  return { plans, saving, loading, saveSuccess, savePlan, fetchPlans, deletePlan };
}