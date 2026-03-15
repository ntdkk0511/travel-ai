// controller -> service -> model
// import jwt from "jsonwebtoken";
// import UserModel from "../models/UserModel.js";
// // serviceがファイルを決める test用にしている。
// fileversion
// class AuthService{
//     static login(email,password){
//         const user = UserModel.getUserByEmail(email);
//         if(!user){
//             console.log("user not found");
//             return null;
//         }
//         if(user.password !== password){
//             console.log("password is not correct");
//             return null;
//         }
//         console.log("ok");
//         const secretKey = "my_secret_key"; // 本番では環境変数にする
//         const token = jwt.sign(
//         { id: user.id, email: user.email, name: user.name  }, // payload（必要最小限）
//         secretKey,
//         { expiresIn: "1h" }                // 有効期限 1時間
//         );

//         return {
//             token: token,
//             user: user
//         };
//     }
//     static verifyToken(token) {
//         try {
//             const decoded = jwt.verify(token, "my_secret_key");
//             return { id: decoded.id, email: decoded.email,name:decoded.name };
//         } catch (err) {
//             throw new Error("Invalid token");
//         }
//     }
// }

//database version
// export default AuthService;
// controller -> service -> model
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

class AuthService {

    static async login(email, password) {

        const user = await UserModel.getUserByEmail(email);

        if (!user) {
            console.log("user not found");
            return null;
        }

        if (user.password !== password) {
            console.log("password is not correct");
            return null;
        }

        console.log("ok");

        const secretKey = "my_secret_key";

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            secretKey,
            { expiresIn: "1h" }
        );

        return {
            token: token,
            user: user
        };
    }

    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, "my_secret_key");
            return {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name
            };
        } catch (err) {
            throw new Error("Invalid token");
        }
    }
}

export default AuthService;
