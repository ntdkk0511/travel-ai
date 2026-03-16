import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api.js";
import "./LoginForm.css";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });
      console.log("response.data:", response.data);
      localStorage.setItem("token", response.data.token);
      onLoginSuccess?.(response.data.user);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "ログインに失敗しました。メールアドレスとパスワードを確認してください。";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lf-wrap">
      {/* ── ヘッダー ── */}
      <div className="lf-header">
        <div className="lf-cat-icon">🐈</div>
        <h2 className="lf-title">ねこたび</h2>
        <p className="lf-subtitle">おかえりなさい。旅の続きをどうぞ。</p>
      </div>

      {/* ── フォーム ── */}
      <form className="lf-form" onSubmit={handleSubmit} noValidate>

        {/* エラー表示 */}
        {error && (
          <div className="lf-error">
            <span className="lf-error-icon">⚠</span>
            {error}
          </div>
        )}

        <div className="lf-field">
          <label className="lf-label">メールアドレス</label>
          <div className="lf-input-wrap">
            <span className="lf-input-icon">✉</span>
            <input
              className="lf-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="lf-field">
          <label className="lf-label">パスワード</label>
          <div className="lf-input-wrap">
            <span className="lf-input-icon">🔑</span>
            <input
              className={`lf-input lf-input--pass${showPass ? " lf-input--visible" : ""}`}
              type={showPass ? "text" : "password"}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="lf-show-pass"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "パスワードを隠す" : "パスワードを表示"}
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button className="lf-btn-submit" type="submit" disabled={loading}>
          {loading ? (
            <span className="lf-loading">
              <span className="lf-dot" />
              <span className="lf-dot" />
              <span className="lf-dot" />
            </span>
          ) : (
            "🐾 ログイン"
          )}
        </button>
      </form>

      {/* ── フッター ── */}
      <p className="lf-footer-text">
        アカウントをお持ちでない方は{" "}
        <a className="lf-link" href="/signup">新規登録</a>
      </p>
    </div>
  );
}
