// test jestを使っている。

const fs = require("fs");
const path = require("path");
const UserService = require("../services/UserService");
const UserController = require("../controllers/UserController.js");
const testDataFile = path.join(__dirname,"../data/user.json");
jest.mock("../services/UserService");



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

// test("weight controller latest test no data",()=>{
//     // fake req
//     const req = {
//         params:{userId:1}
//     };
//     // fake res
//     const res = {
//         json:jest.fn(),
//         status: jest.fn().mockReturnThis()
//     }

//     // service mock
//     WeightService.getLatestWeight.mockReturnValue(null);
//     WeightController.getLatestWeight(req,res);
//     expect(res.json).toHaveBeenCalledWith({message:"no data"});
// })

// test("weight controller create",()=>{
//     // fake req
//     const req = {
//         body:{userId:1,weight:65} //コントローラーに合わせて変更する
//     };
//     // fake res
//     const res = {
//         json:jest.fn(),
//         status: jest.fn().mockReturnThis()
//     }

//     // service mock
//     WeightService.createWeight.mockReturnValue({
//         userId:1,weight:65
//     });
//     WeightController.createWeight(req,res);
//     expect(res.json).toHaveBeenCalledWith({
//         userId:1,weight:65
//     });
//     expect(WeightService.createWeight).toHaveBeenCalledWith(1,65); //サービスが正しく呼ばれたか？

// })