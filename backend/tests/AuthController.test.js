// test jestを使っている。

import { jest, test, expect, beforeEach, afterAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";
import AuthController from "../controllers/AuthController.js";
import UserModel from "../models/UserModel.js";
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
