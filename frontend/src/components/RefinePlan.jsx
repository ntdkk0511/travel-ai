// プラン生成後に表示される追加要望入力欄＋ボタン

import { useState } from "react";

export default function RefinePlan({ onRefine, loading }) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim()) return;
    onRefine(feedback);
    setFeedback("");
  };

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <p style={{ margin: "0 0 10px", fontWeight: "bold", fontSize: "14px" }}>
        🔧 プランへの追加要望
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="例：ランチはラーメンにしたい、移動を電車に変えて"
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !feedback.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#aaa" : "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: loading || !feedback.trim() ? "default" : "pointer",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "再生成中..." : "この要望でプランを更新"}
        </button>
      </div>
    </div>
  );
}
