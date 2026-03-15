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
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    axios.get("http://localhost:3000/auth/check-token", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      // サーバーが返すユーザー情報を保持
      console.log("check-token response:", res.data);
      setUser(res.data.user || null);
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

  if (isLoggedIn === null) return <div>Loading...</div>; // 読み込み中表示

  // return isLoggedIn && user? (
  return isLoggedIn ?(
    <App user={user} onLogout={() => {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
    }} />
  ) : (
    <Test onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}
