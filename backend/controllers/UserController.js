// ルートから受け取ったリクエストを処理する場所
// ここでサービスやDBを呼び出して、レスポンスを返す。
// routine -> controller -> service

const express = require("express");
const router = express.Router();
const UserService = require("../services/UserService");

class UserController{
    //登録用
    static createUser(req,res){
        // const {userId,weight} = req.params; params はurlから切り取って作る。
        const {name,email,password} = req.body;

        const result = UserService.createUser(name,email,password);
        res.json(result);
    }
    // 最近の値を取ってくる
    static getUserById(req,res){
        const id = req.params.id;
        const user = UserService.getUserById(id);
        //ない時
        if(!user){
            return res.json({message:"no data"});
        }
        res.json(user);

    }
}

module.exports = UserController;

// url の確認用
exports.createUser = (req, res) => {
  // 仮で body をそのまま返す
  res.json({
    message: "createUser OK",
    data: req.body
  });
};