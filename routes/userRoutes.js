import express from "express";
import { deleteUser, updateUser, userDetail, userList, userLogin, userRegister } from "../service/userServcices.js";

const router = express.Router();

router.get("/", userList);

//by id
router.get("/:id", userDetail);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

//login
router.post("/login", userLogin);
router.post("/register", userRegister);

export default router;
