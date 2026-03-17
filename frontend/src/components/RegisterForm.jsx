import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api.js";
import "./RegisterForm.css";

export default function RegisterForm({ onRegisterSuccess }) {
  const [name, setName] = useState("");
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
      const response = await axios.post(`${API_BASE}/users/register`, {
        name, email, password,
      });
      console.log(response.data);
      onRegisterSuccess?.();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "登録に失敗しました。もう一度お試しください。";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rf-wrap">
      {/* ── ヘッダー ── */}
      <div className="rf-header">
        <div className="rf-cat-icon">🐱</div>
        <h2 className="rf-title">ねこたび</h2>
        <p className="rf-subtitle">はじめまして。旅をはじめましょう。</p>
      </div>

      {/* ── フォーム ── */}
      <form className="rf-form" onSubmit={handleSubmit} noValidate>

        {/* エラー表示 */}
        {error && (
          <div className="rf-error">
            <span className="rf-error-icon">⚠</span>
            {error}
          </div>
        )}

        <div className="rf-field">
          <label className="rf-label">お名前</label>
          <div className="rf-input-wrap">
            <span className="rf-input-icon">👤</span>
            <input
              className="rf-input"
              type="text"
              placeholder="旅人の名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="rf-field">
          <label className="rf-label">メールアドレス</label>
          <div className="rf-input-wrap">
            <span className="rf-input-icon">✉</span>
            <input
              className="rf-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="rf-field">
          <label className="rf-label">パスワード</label>
          <div className="rf-input-wrap">
            <span className="rf-input-icon">🔑</span>
            <input
              className={`rf-input rf-input--pass${showPass ? " rf-input--visible" : ""}`}
              type={showPass ? "text" : "password"}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="rf-show-pass"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "パスワードを隠す" : "パスワードを表示"}
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button className="rf-btn-submit" type="submit" disabled={loading}>
          {loading ? (
            <span className="rf-loading">
              <span className="rf-dot" />
              <span className="rf-dot" />
              <span className="rf-dot" />
            </span>
          ) : (
            "🐾 新規登録"
          )}
        </button>
      </form>
    </div>
  );
}
