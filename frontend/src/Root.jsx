import { useEffect, useState } from 'react'
import App from './App.jsx'
import Test from './test.jsx'
// 認証の追加
import axios from 'axios';
// 認証の機能のファイル
export default function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = 読み込み中
  const [user, setUser] = useState(null); // 認証済みユーザー情報

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token|| token === "undefined") {
      queueMicrotask(() => setIsLoggedIn(false));
      return;
    }

    axios.get("http://localhost:3000/auth/check-token", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      const userData = res.data.user || null;
      // 1. まずユーザー情報をセット
      setUser(userData);
      // 2. その後でログインフラグを立てる
      setIsLoggedIn(true);
    })
    .catch((err) => {
      console.error("check-token error:", err);
      localStorage.removeItem("token"); // 無効なら削除
      console.log("token");
      setUser(null);
      setIsLoggedIn(false);
    });
  }, []);
  // Root.jsx (Rendering部分)
  if (isLoggedIn === null) return <div>Loading...</div>;

  // isLoggedIn が true かつ user が存在する場合のみ App を出す
  if (isLoggedIn && user) {
    return (
      <App
        user={user}
        onLogout={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUser(null);
        }}
      />
    );
  }

  // それ以外（未ログイン）は Test (Login画面)
  return (
    <Test
      onLoginSuccess={(userData) => { // 🔴 受け取ったデータを引数に取る
        setUser(userData);            // 🔴 ユーザー情報をセット
        setIsLoggedIn(true);          // 🔴 ログイン状態をセット
      }}
    />
  );
}
