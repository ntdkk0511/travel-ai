// プラン生成結果の下に表示する保存ボタン

export default function SavePlanButton({ onSave, saving, saveSuccess, disabled }) {
  if (disabled) return null; // プランがない時は非表示

  return (
    <div style={{ marginTop: "12px" }}>
      <button
        onClick={onSave}
        disabled={saving || saveSuccess}
        style={{
          padding: "8px 20px",
          backgroundColor: saveSuccess ? "#4caf50" : "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: saving || saveSuccess ? "default" : "pointer",
          fontSize: "14px",
        }}
      >
        {saveSuccess ? "✅ 保存しました！" : saving ? "保存中..." : "📌 このプランを保存する"}
      </button>
    </div>
  );
}
