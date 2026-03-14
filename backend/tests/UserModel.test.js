// test jestを使っている。

const fs = require("fs");
const path = require("path");

const UserModel = require("../models/UserModel");
const testDataFile = path.join(__dirname,"../data/users.json");

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
// 名前と行う関数
// 作成とjson
test("createUser should return a user with id,name,email",()=>{
    const user = UserModel.createUser("alice","ai.gmail.com","1234",file = testDataFile);
    //うまく作れているのかの確認
    expect(user).toHaveProperty("id");
    expect(user.name).toBe("alice");
    expect(user.email).toBe("ai.gmail.com");
    // jsonファイルの確認
    const usersInfile = JSON.parse(fs.readFileSync(testDataFile,"utf-8"));
    expect(usersInfile.length).toBe(1);
    expect(usersInfile[0].name).toBe("alice");

});
// by idのテスト
test("get_user_by_id",()=>{
    const user = UserModel.createUser("ai","ai.gmail.com","1234",file=testDataFile);
    const found = UserModel.getUserById(user.id,testDataFile);
    expect(user.password).toBe(found.password);

})
