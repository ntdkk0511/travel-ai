// ルートから受け取ったリクエストを処理する場所
// ここでサービスやDBを呼び出して、レスポンスを返す。
// routine -> controller -> service

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


import UserService from "../services/UserService.js";

class UserController {

    // 登録
    static async createUser(req, res) {
        try {
            const { name, email, password } = req.body;

            const result = await UserService.createUser(name, email, password);

            res.json(result);

        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // id検索
    static async getUserById(req, res) {
        try {
            const id = req.params.id;

            const user = await UserService.getUserById(id);

            if (!user) {
                return res.json({ message: "no data" });
            }

            res.json(user);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

}

export default UserController;
