import React, { useState } from "react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import "./test.css";

function App({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-scene">
      {isLogin ? (
        <LoginForm onLoginSuccess={(user) => onLoginSuccess(user)} />
      ) : (
        <RegisterForm onRegisterSuccess={() => setIsLogin(true)} />
      )}

      <p className="auth-toggle-text">
        {isLogin ? "アカウントをお持ちでない方は" : "すでにアカウントをお持ちの方は"}
        <button
          className="auth-toggle-btn"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "新規登録" : "ログイン"}
        </button>
      </p>
    </div>
  );
}

export default App;
