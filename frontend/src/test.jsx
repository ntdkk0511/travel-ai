import React, { useState } from "react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";

function App({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true); // true: Login, false: Register

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
            {isLogin ? <LoginForm onLoginSuccess={onLoginSuccess} /> : <RegisterForm onRegisterSuccess={() => setIsLogin(true)} />}
            <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} style={{ marginLeft: "0.5rem" }}>
                    {isLogin ? "Register" : "Login"}
                </button>
            </p>
        </div>
    );
}

export default App;
