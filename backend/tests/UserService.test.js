// test jestを使っている。

const fs = require("fs");
const path = require("path");

const UserService = require("../services/UserService");
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
test("service create latest test",()=>{
    const weight = UserService.createUser("ai","ai.gmail.com","1234",file=testDataFile);
    expect(weight.name).toBe("ai");
})