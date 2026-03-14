// ログインの確認用 node app.js を使って確認してください。
import cors from "cors";
import express from "express";
const app = express();

app.use(express.json());
app.use(cors()); // これで全てのオリジンからアクセス可能
import UserRoutes from "./routes/UserRoute.js";
import authRoutes from "./routes/AuthRoute.js";

app.use("/auth", authRoutes);
app.use("/users",UserRoutes);

app.listen(3000, () => {
  console.log("server running on 3000");
});

export default app;
