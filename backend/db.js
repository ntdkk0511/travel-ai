// db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB 接続成功");
  } catch (err) {
    console.error("MongoDB 接続エラー:", err);
    process.exit(1);
  }
};

export default connectDB;