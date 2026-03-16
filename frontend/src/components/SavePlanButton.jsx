import "./SavePlanButton.css";

export default function SavePlanButton({ onSave, saving, saveSuccess, disabled }) {
  if (disabled) return null;

  return (
    <div className="spb-wrap">
      <button
        className={`spb-btn ${saveSuccess ? "spb-btn--success" : ""}`}
        onClick={onSave}
        disabled={saving || saveSuccess}
      >
        {saveSuccess ? (
          <>
            <span className="spb-icon">✓</span>
            保存しました！
          </>
        ) : saving ? (
          <>
            <span className="spb-spinner" />
            保存中…
          </>
        ) : (
          <>
            <span className="spb-icon">📌</span>
            このプランを保存する
          </>
        )}
      </button>
    </div>
  );
}
