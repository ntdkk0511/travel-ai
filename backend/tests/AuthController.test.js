// test jestを使っている。

const fs = require("fs");
const path = require("path");

const AuthService = require("../services/AuthService");
const UserService = require("../services/UserService");
const AuthController = require("../controllers/AuthController");
const UserModel = require("../models/UserModel");
const testDataFile = path.join(__dirname,"../data/user.json");

// testように変更する
// UserModel.dataFile = testDataFile;

beforeEach(()=>{
    // から配列で初期化する
    fs.writeFileSync(testDataFile,"[]","utf-8");
});

afterAll(()=>{
    //テスト後にファイルを削除
    fs.unlinkSync(testDataFile);
});

test("login in controller",()=>{
    const req = {
        body:{
            email:"ai.gmail.com",
            password:"1234"
        }
    };

    const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
    };


    AuthService.login = jest.fn().mockReturnValue({
    token:"abc123",
    user:{name:"ai"}
    });
    AuthController.login(req,res);
    expect(res.json).toHaveBeenCalledWith({
    token:"abc123",
    user:{name:"ai"}
    });
})