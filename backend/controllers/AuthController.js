// ルートから受け取ったリクエストを処理する場所
// ここでサービスやDBを呼び出して、レスポンスを返す。
// routine -> controller -> service

const express = require("express");
const router = express.Router();
const AuthService = require("../services/AuthService");

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

module.exports = AuthController;