import { useState, useCallback } from "react";
const API_BASE = "http://localhost:3000";

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("取得エラー:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (postId, { userId, userName, text }) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName, text }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => p._id === postId ? updated : p));
      }
    } catch (err) {
      console.error("コメントエラー:", err);
    }
  }, []);

  return { posts, loading, fetchPosts, addComment };
}