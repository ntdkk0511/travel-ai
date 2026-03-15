import { useState } from "react";
import { API_BASE } from "../api.js";

export default function MyPlans({ plans, loading, onFetch, onDelete, user }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [postingId, setPostingId] = useState(null); // 投稿フォームを開いているプランID
  const [comment, setComment] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);

  const handleToggle = () => {
    if (!open) onFetch();
    setOpen((prev) => !prev);
  };

  const handlePost = async (p) => {
    if (!comment.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          planId: p._id,
          title: p.title,
          plan: p.plan,
          comment,
          photos: [],
        }),
      });
      if (res.ok) {
        setPostSuccess(true);
        setComment("");
        setPostingId(null);
        setTimeout(() => setPostSuccess(false), 3000);
      }
    } catch (err) {
      console.error("投稿エラー:", err);
    }
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

      {postSuccess && (
        <p style={{ color: "green", marginTop: "8px" }}>✅ 掲示板に投稿しました！</p>
      )}

      {open && (
        <div style={{ marginTop: "12px" }}>
          {loading && <p>読み込み中...</p>}

          {!loading && plans.length === 0 && (
            <p style={{ color: "#888" }}>保存されたプランはありません。</p>
          )}

          {plans.map((p) => (
            <div
              key={p._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "10px",
                backgroundColor: "#fafafa",
              }}
            >
              {/* ヘッダー行 */}
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
                    onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
                    style={{ fontSize: "12px", cursor: "pointer", padding: "4px 10px" }}
                  >
                    {expandedId === p._id ? "閉じる" : "詳細"}
                  </button>
                  <button
                    onClick={() => {
                      setPostingId(postingId === p._id ? null : p._id);
                      setComment("");
                    }}
                    style={{
                      fontSize: "12px",
                      cursor: "pointer",
                      padding: "4px 10px",
                      backgroundColor: "#e3f2fd",
                      border: "1px solid #90caf9",
                      borderRadius: "4px",
                    }}
                  >
                    📢 投稿
                  </button>
                  <button
                    onClick={() => onDelete(p._id)}
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

              {/* 詳細 */}
              {expandedId === p._id && (
                <pre style={{
                  marginTop: "10px",
                  whiteSpace: "pre-wrap",
                  fontSize: "13px",
                  backgroundColor: "#fff",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #eee",
                }}>
                  {p.plan}
                </pre>
              )}

              {/* 掲示板投稿フォーム */}
              {postingId === p._id && (
                <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#e3f2fd", borderRadius: "6px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "bold" }}>📢 掲示板に投稿</p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="コメントを入力してください..."
                    rows={3}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #90caf9", boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <button
                      onClick={() => handlePost(p)}
                      style={{ padding: "6px 14px", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      投稿する
                    </button>
                    <button
                      onClick={() => setPostingId(null)}
                      style={{ padding: "6px 14px", cursor: "pointer" }}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}