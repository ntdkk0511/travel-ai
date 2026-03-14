// test jestを使っている。

import { test, expect, beforeEach, afterAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import UserService from "../services/UserService.js";
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
test("service create latest test",()=>{
    const user = UserService.createUser("ai","ai.gmail.com","1234",testDataFile);
    expect(user.name).toBe("ai");
})
