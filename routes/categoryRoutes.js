import { addCategory, getCategoryByid, deleteCategory, getAllCategory, updateCategory, getCategoryCount } from "../service/cateogryServices.js";
import express from "express";

const router = express.Router();

router.post("/", addCategory);
router.get("/", getAllCategory);
router.get("/get/count", getCategoryCount);

//by id
router.get("/:id", getCategoryByid);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
