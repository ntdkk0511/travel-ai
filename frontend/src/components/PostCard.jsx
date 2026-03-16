import { useState } from "react";

export default function PostCard({ post, user, onAddComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showPlan, setShowPlan] = useState(false);

  const handleComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post._id, {
      userId: user?.id,
      userName: user?.name,
      text: commentText,
    });
    setCommentText("");
  };

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "16px",
      backgroundColor: "#fff",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    }}>
      {/* ヘッダー */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong style={{ fontSize: "16px" }}>{post.title}</strong>
          <span style={{ color: "#888", fontSize: "12px", marginLeft: "10px" }}>
            by {post.userName}
          </span>
        </div>
        <span style={{ color: "#aaa", fontSize: "12px" }}>
          {new Date(post.createdAt).toLocaleDateString("ja-JP")}
        </span>
      </div>

      {/* 投稿コメント */}
      {post.comment && (
        <p style={{ marginTop: "10px", color: "#444", fontSize: "14px" }}>
          💬 {post.comment}
        </p>
      )}

      {/* プラン詳細 */}
      <button
        onClick={() => setShowPlan((p) => !p)}
        style={{ marginTop: "8px", fontSize: "12px", cursor: "pointer", padding: "4px 10px" }}
      >
        {showPlan ? "プランを閉じる" : "プランを見る"}
      </button>

      {showPlan && (
        <pre style={{
          marginTop: "10px",
          whiteSpace: "pre-wrap",
          fontSize: "12px",
          backgroundColor: "#f9f9f9",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #eee",
        }}>
          {post.plan}
        </pre>
      )}

      {/* コメント一覧 */}
      <div style={{ marginTop: "12px" }}>
        <button
          onClick={() => setShowComments((p) => !p)}
          style={{ fontSize: "12px", cursor: "pointer", color: "#1976d2" }}
        >
          💬 コメント ({post.comments?.length || 0})
        </button>

        {showComments && (
          <div style={{ marginTop: "8px" }}>
            {post.comments?.length === 0 && (
              <p style={{ color: "#aaa", fontSize: "13px" }}>まだコメントはありません</p>
            )}
            {post.comments?.map((c, i) => (
              <div key={i} style={{
                padding: "6px 10px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
                marginBottom: "6px",
                fontSize: "13px",
              }}>
                <strong>{c.userName}</strong>: {c.text}
              </div>
            ))}

            {/* コメント入力 */}
            {user && (
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="コメントを入力..."
                  style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
                <button
                  onClick={handleComment}
                  style={{ padding: "6px 12px", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  送信
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}