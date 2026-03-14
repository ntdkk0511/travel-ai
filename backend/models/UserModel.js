// データ構造とDB操作をまとめる場所
// 最初は　userから作る　plan と weight はuserIdで紐づくから

// uuidがいる
const {v4 :uuidv4} = require("uuid");

// getalluserの準備　ファイルの読み取り
const fs = require("fs") //ファイルの読み取り
const path = require("path") //


const dataFile = path.join(__dirname,"../data/user.json"); //__dirname はこのファイルの場所 ..は一つ上


class UserModel{ // フォイルを指定する
    constructor(id,name,email,password){
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }


    // なくても呼べる jsonの読み込み json → 配列
    static getAllUsers(file = dataFile){
        try{
            const data = fs.readFileSync(file,"utf-8");//読み取り
            return JSON.parse(data || "[]"); // json → js の配列に からのときも
        }catch(err){
            if(err.code==="ENOENT"){
                return []; //ない時はから配列
            }
            throw err;//エラーが表示される
        }
    }
    // CRUD を作る。
    // getAlluserの逆をする　配列　→ json 対象を示す
    save(file = dataFile){
        const users = UserModel.getAllUsers(file);
        users.push(this);
        fs.writeFileSync(file,JSON.stringify(users,null,2));
        return this;
    }
    // モデルを作らないくても　呼び出せる static
    static createUser(name,email,password,file = dataFile){
        const id = uuidv4();
        const user = new UserModel(id,name,email,password,file);
        user.save(file);
        return user;
    }
    // 対象になるファイルを明言する
    static getUserById(id,file = dataFile){
        const users = UserModel.getAllUsers(file);
        return users.find(user => user.id === id); //id と同じuserを{}で取ってくる
    }
    // ログイン用
    static getUserByEmail(email,file=dataFile){
        const users = UserModel.getAllUsers(file);
        console.log("all users:", users);
        return users.find(user=> user.email === email);
    }

}
module.exports = UserModel; //エキスポートする

