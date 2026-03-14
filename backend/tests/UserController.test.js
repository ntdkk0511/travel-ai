// test jestを使っている。

import { jest, test, expect, beforeEach, afterAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testDataFile = path.join(__dirname,"../data/user.json");

jest.unstable_mockModule("../services/UserService.js", () => ({
    default: { createUser: jest.fn(), getUserById: jest.fn() },
}));
const { default: UserService } = await import("../services/UserService.js");
const { default: UserController } = await import("../controllers/UserController.js");


beforeEach(()=>{
    // から配列で初期化する
    fs.writeFileSync(testDataFile,"[]","utf-8");
});

afterAll(()=>{
    //テスト後にファイルを削除
    fs.unlinkSync(testDataFile);
});

test("user controller get by id",()=>{
    // fake req
    const req = {
        params:{id:1}
    };
    // fake res
    const res = {
        json:jest.fn(),
        status: jest.fn().mockReturnThis()
    }

    // service mock
    UserService.getUserById.mockReturnValue({
        id: "1",
        name: "Alice",
        email: "alice@example.com",
        password: "123"
    });
    UserController.getUserById(req,res);
    expect(res.json).toHaveBeenCalledWith({
        id: "1",
        name: "Alice",
        email: "alice@example.com",
        password: "123"
    });
})
