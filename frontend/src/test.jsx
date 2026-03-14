import React, { useState } from "react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";

function App() {
    const [isLogin, setIsLogin] = useState(true); // true: Login, false: Register

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
            {isLogin ? <LoginForm /> : <RegisterForm />}
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
