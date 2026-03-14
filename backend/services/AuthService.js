// controller -> service -> model
const path = require("path");

const UserModel = require("../models/UserModel");
// serviceがファイルを決める test用にしている。

class AuthService{
    static login(email,password){
        const user = UserModel.getUserByEmail(email);
        if(!user){
            console.log("user not found");
            return null;
        }
        if(user.password !== password){
            console.log("password is not correct");
            return null;
        }
        console.log("ok");
        return {
            token: "abc123",
            user: user
        };
    }
}
module.exports = AuthService;
