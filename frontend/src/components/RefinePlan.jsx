import { useState } from "react";
import "./RefinePlan.css";

export default function RefinePlan({ onRefine, loading }) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    onRefine(feedback);
    setFeedback("");
  };

  return (
    <div className="rp-wrap">
      <p className="rp-label">
        <span className="rp-label-icon">🔧</span>
        プランへの追加要望
      </p>
      <div className="rp-row">
        <input
          className="rp-input"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="例：ランチはラーメンにしたい、移動を電車に変えて"
          disabled={loading}
        />
        <button
          className="rp-btn"
          onClick={handleSubmit}
          disabled={loading || !feedback.trim()}
        >
          {loading ? (
            <span className="rp-spinner" />
          ) : (
            "更新"
          )}
        </button>
      </div>
      {loading && (
        <p className="rp-loading-msg">
          <span className="rp-dot" /><span className="rp-dot" /><span className="rp-dot" />
          再生成中にゃ…
        </p>
      )}
    </div>
  );
}
