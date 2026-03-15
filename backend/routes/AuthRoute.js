import express from "express";
const router = express.Router();

import AuthController from "../controllers/AuthController.js";

router.post("/login", AuthController.login);
router.get("/check-token", AuthController.checkToken);
export default router;
