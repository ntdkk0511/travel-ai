// controller -> service -> model
// import jwt from "jsonwebtoken";
// import UserModel from "../models/UserModel.js";
// // serviceがファイルを決める test用にしている。

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
// export default AuthService;


//database
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

class AuthService {
  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("user not found");
      return null;
    }
    if (user.password !== password) {
      console.log("password is not correct");
      return null;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name }, // _id に変更
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // ✅ _id ではなく id に統一
    return {
      token,
      user: { id: user._id, email: user.email, name: user.name }
    };
  }

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { id: decoded.id, email: decoded.email, name: decoded.name };
    } catch (err) {
      throw new Error("Invalid token");
    }
  }
}

export default AuthService;