import express from "express";
import { addOrders, deleteOrder, editOrders, getOrderdetails, getOrderLists, totalOrders, totalSales } from "../service/orderService.js";

const router = express.Router();

router.post("/", addOrders);
router.get("/", getOrderLists);
router.get("/get/totalsales", totalSales);
router.get("/get/totalorders", totalOrders);

//by id
router.get("/:id", getOrderdetails);
router.put("/:id", editOrders);
router.delete("/:id", deleteOrder);

export default router;
