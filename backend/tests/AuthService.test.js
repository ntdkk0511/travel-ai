// test jestを使っている。

const fs = require("fs");
const path = require("path");

const AuthService = require("../services/AuthService");
const UserService = require("../services/UserService");
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
test("login service",()=>{
    UserModel.getUserByEmail = jest.fn().mockReturnValue({
    name:"ai",
    email:"ai.gmail.com",
    password:"1234"
    });
    const result = AuthService.login("ai.gmail.com","1234");
    expect(result.token).toBe("abc123");
})