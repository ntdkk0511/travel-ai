// // ルートから受け取ったリクエストを処理する場所
// // ここでサービスやDBを呼び出して、レスポンスを返す。
// // routine -> controller -> service

// import AuthService from "../services/AuthService.js";
// import jwt from "jsonwebtoken";

// // uscase ??

// class AuthController {
//     static login(req, res) {
//         const { email, password } = req.body;

//         const result = AuthService.login(email, password);
//         if (!result) {
//             return res.status(401).json({ message: "login failed" });
//         }
//         res.json(result);
//     }
//     //token のチェックをしている。
//     static checkToken(req, res) {
//         const authHeader = req.headers.authorization;
//         if (!authHeader) return res.status(401).json({ message: "No token" });

//         const token = authHeader.split(" ")[1];
//         console.log(res.data); // Root.jsx の then 内で
//         console.log("token:" + token);
//         try {
//             const userData = AuthService.verifyToken(token);
//             return res.json({ user: userData });
//         } catch (err) {
//             console.error("error:" + err);
//             return res.status(401).json({ message: "Invalid token" });
//         }
//     }
// }

// export default AuthController;

import AuthService from "../services/AuthService.js";

class AuthController {

    // ログイン
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            const result = await AuthService.login(email, password);

            if (!result) {
                return res.status(401).json({ message: "login failed" });
            }

            res.json(result);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // tokenチェック
    static checkToken(req, res) {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token" });
        }

        const token = authHeader.split(" ")[1];

        try {
            const userData = AuthService.verifyToken(token);

            return res.json({ user: userData });

        } catch (err) {

            console.error("error:", err);
            return res.status(401).json({ message: "Invalid token" });

        }
    }
}

export default AuthController;

