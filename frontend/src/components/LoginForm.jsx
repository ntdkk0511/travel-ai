import { useState } from "react";
import axios from "axios";

export default function LoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // 🔴 エラーメッセージ用のState
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await axios.post("http://localhost:3000/auth/login", {
                email, password
            });
            console.log("response.data:",response.data);
            localStorage.setItem("token", response.data.token);

            // ← user を渡す
            onLoginSuccess?.(response.data.user);
        } catch (error) {
// 🔴 サーバーからのメッセージがあればそれを表示、なければ標準メッセージを表示
        const msg = error.response?.data?.message || "ログインに失敗しました。メールアドレスとパスワードを確認してください。";
        setError(msg);
        }
    };

    // return (
    //     <form onSubmit={handleSubmit}>
    //         <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
    //         <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
    //         <button type="submit">Login</button>
    //     </form>
    // );
    return (
            <form onSubmit={handleSubmit}>
                {/* 🔴 ここを追加してください：errorがある時だけ表示されます */}
                {error && <p style={{ color: "red" }}>{error}</p>}

                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
    );
}
