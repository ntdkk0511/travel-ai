import { useEffect } from "react";
import { usePosts } from "../hooks/usePosts";
import PostCard from "./PostCard";

export default function Board({ user }) {
  const { posts, loading, fetchPosts, addComment } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div>
      <h2>📋 みんなの旅行プラン</h2>

      {loading && <p>読み込み中...</p>}

      {!loading && posts.length === 0 && (
        <p style={{ color: "#888" }}>まだ投稿がありません。</p>
      )}

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          user={user}
          onAddComment={addComment}
        />
      ))}
    </div>
  );
}