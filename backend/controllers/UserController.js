// // ルートから受け取ったリクエストを処理する場所
// // ここでサービスやDBを呼び出して、レスポンスを返す。
// // routine -> controller -> service

// import UserService from "../services/UserService.js";

// class UserController{
//     //登録用
//     static createUser(req,res){
//         // const {userId,weight} = req.params; params はurlから切り取って作る。
//         const {name,email,password} = req.body;

//         const result = UserService.createUser(name,email,password);
//         res.json(result);
//     }
//     // 最近の値を取ってくる
//     static getUserById(req,res){
//         const id = req.params.id;
//         const user = UserService.getUserById(id);
//         //ない時
//         if(!user){
//             return res.json({message:"no data"});
//         }
//         res.json(user);

//     }
// }

// export default UserController;
// database
import UserService from "../services/UserService.js";

class UserController {
  static async createUser(req, res) {
    try {
      const { name, email, password } = req.body;
      const result = await UserService.createUser(name, email, password);
      res.status(201).json(result);
    } catch (err) {
      // メールアドレス重複エラー（unique制約）
      if (err.code === 11000) {
        return res.status(400).json({ message: "このメールアドレスは既に使われています" });
      }
      console.error("createUser error:", err);
      res.status(500).json({ message: "server error" });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "no data" });
      }
      res.json(user);
    } catch (err) {
      console.error("getUserById error:", err);
      res.status(500).json({ message: "server error" });
    }
  }
}

export default UserController;