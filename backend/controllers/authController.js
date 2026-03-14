import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const SECRET_KEY = "secretkey";

// named export に統一
export const register = async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = User.create({ email, password: hashed });
  res.json({ message: "user created", user });
};

export const login = (req, res) => {
  const { email, password } = req.body;
  const user = User.getAllUsers().find(u => u.email === email);

  if (!user) return res.status(401).json({ message: "ユーザーが存在しません" });

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) return res.status(401).json({ message: "パスワードが違います" });

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
};
