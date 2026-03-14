// ルートから受け取ったリクエストを処理する場所
// ここでサービスやDBを呼び出して、レスポンスを返す。
// routine -> controller -> service

import AuthService from "../services/AuthService.js";

class AuthController{
    static login(req,res){
        const { email, password } = req.body;

        const result = AuthService.login(email,password);
        if(!result){
          return res.status(401).json({message:"login failed"});
        }
        res.json(result);
    }
}

export default AuthController;
