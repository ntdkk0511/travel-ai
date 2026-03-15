import { useState } from "react";
import axios from "axios";

export default function LoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/auth/login", {
                email, password
            });
            console.log("response.data:",response.data);
            localStorage.setItem("token", response.data.token);

            // ← user を渡す
            onLoginSuccess?.(response.data.user);
        } catch (error) {
            console.error(error.response?.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
}
