// // controller -> service -> model
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// ファイルversion
// import UserModel from "../models/UserModel.js";
// // serviceがファイルを決める test用にしている。
// class UserService{
//     // 新規作成
//     static createUser(name,email,password){
//         const file = path.join(__dirname,"../data/user.json");
//         return UserModel.createUser(name,email,password,file);
//     }
//     static getUserById(id){
//         const file =path.join(__dirname,"../data/user.json");
//         return UserModel.getUserById(id,file);
//     }

// }
// export default UserService;

// database
import UserModel from "../models/UserModel.js";

class UserService {

    // 新規作成
    static async createUser(name, email, password) {

        const existingUser = await UserModel.getUserByEmail(email);

        if (existingUser) {
            throw new Error("Email already exists");
        }

        return await UserModel.createUser(name, email, password);
    }

    // id検索
    static async getUserById(id) {
        return await UserModel.getUserById(id);
    }

}

export default UserService;

