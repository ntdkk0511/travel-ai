// controller -> service -> model
const path = require("path");

const UserModel = require("../models/UserModel");
// serviceがファイルを決める test用にしている。
class UserService{
    // 新規作成
    static createUser(name,email,password){
        const file = path.join(__dirname,"../data/user.json");
        return UserModel.createUser(name,email,password,file);
    }
    static getUserById(id){
        const file =path.join(__dirname,"../data/user.json");
        return UserModel.getUserById(id,file);
    }

}
module.exports = UserService;