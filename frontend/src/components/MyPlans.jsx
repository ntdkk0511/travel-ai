// 保存済みプラン一覧の表示コンポーネント

import { useEffect, useState } from "react";

export default function MyPlans({ plans, loading, onFetch, onDelete }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = () => {
    if (!open) onFetch(); // 開くタイミングで取得
    setOpen((prev) => !prev);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={handleToggle}
        style={{
          padding: "8px 16px",
          backgroundColor: "#f5f5f5",
          border: "1px solid #ccc",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {open ? "▲ 保存済みプランを閉じる" : "📂 保存済みプランを見る"}
      </button>

      {open && (
        <div style={{ marginTop: "12px" }}>
          {loading && <p>読み込み中...</p>}

          {!loading && plans.length === 0 && (
            <p style={{ color: "#888" }}>保存されたプランはありません。</p>
          )}

          {plans.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "10px",
                backgroundColor: "#fafafa",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{p.title}</strong>
                  <span style={{ color: "#888", fontSize: "12px", marginLeft: "10px" }}>
                    {p.startDate}
                    {p.nights > 0 ? ` 〜 ${p.endDate}（${p.nights}泊）` : "（日帰り）"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    style={{ fontSize: "12px", cursor: "pointer", padding: "4px 10px" }}
                  >
                    {expandedId === p.id ? "閉じる" : "詳細"}
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    style={{
                      fontSize: "12px",
                      cursor: "pointer",
                      padding: "4px 10px",
                      color: "#e53935",
                      border: "1px solid #e53935",
                      backgroundColor: "white",
                      borderRadius: "4px",
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>

              {expandedId === p.id && (
                <pre
                  style={{
                    marginTop: "10px",
                    whiteSpace: "pre-wrap",
                    fontSize: "13px",
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #eee",
                  }}
                >
                  {p.plan}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
