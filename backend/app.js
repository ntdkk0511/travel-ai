// ログインの確認用 node app.js を使って確認してください。
// import cors from "cors";
const cors = require("cors");
const express = require("express");
const app = express();

app.use(express.json());
app.use(cors()); // これで全てのオリジンからアクセス可能
const UserRoutes = require("./routes/UserRoute");
const authRoutes = require("./routes/AuthRoute");

app.use("/auth", authRoutes);
app.use("/users",UserRoutes);

app.listen(3000, () => {
  console.log("server running on 3000");
});

module.exports = app;

