import express from "express";                 // ← require の代わり
import { register, login } from "../controllers/authController.js";
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
