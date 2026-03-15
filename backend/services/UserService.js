// // controller -> service -> model
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

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
import User from "../models/UserModel.js";

class UserService {
  static async createUser(name, email, password) {
    const user = new User({ name, email, password });
    return await user.save();
  }

  static async getUserById(id) {
    return await User.findById(id);
  }

  static async getAllUsers() {
    return await User.find();
  }

  static async getUserByEmail(email) {
    return await User.findOne({ email });
  }
}

export default UserService;