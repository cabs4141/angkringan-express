import express from "express";
import { addToCart, deleteCartItems, editQty, getCart } from "../service/cartService.js";

const router = express.Router();

router.get("/cart-list/:id", getCart);
router.post("/add-to-cart", addToCart);
router.put("/edit-qty/:id", editQty);
router.post("/delete", deleteCartItems);

export default router;
