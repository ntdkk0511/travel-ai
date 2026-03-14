// URL と　Controller の橋渡しをする
// ex /weight への　POST や GET をどの Controller に渡すかを定義する
// urlparam(post body) → route → controller
// test はいらない

import express from "express";
const router = express.Router();
import UserController from "../controllers/UserController.js";

// 体重登録 body(form) -> post
router.post("/register",UserController.createUser)


// 最新の体重の取得 param(url) get 先頭の/を忘れない
router.get("/latest/:id",UserController.createUser);

export default router;
