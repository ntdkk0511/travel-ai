// // db.js
// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB 接続成功");
//   } catch (err) {
//     console.error("MongoDB 接続エラー:", err);
//     process.exit(1);
//   }
// };

// export default connectDB;
import mongoose from "mongoose";
import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);
const connectDB = async () => {
  console.log("MONGO_URI の値:", process.env.MONGO_URI); // ← 追加
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB 接続成功");
  } catch (err) {
    console.error("MongoDB 接続エラー:", err.message);
    process.exit(1);
  }
};

export default connectDB;