import express from "express";
import { addProduct, getAllProduct, getProductById, deleteProduct, editProduct, getProductCount, featuredProducts, searchProducts, uploadOptions, editGalleryImages, editProductImage } from "../service/productServices.js"; // Pastikan path dan ekstensi benar

const router = express.Router();

router.post("/", uploadOptions.single("image"), addProduct);
router.get("/", getAllProduct);
router.get("/get/count", getProductCount);

//limit featured
router.get("/get/featured/limit=:limit", featuredProducts);

//query by name
router.get("/search", searchProducts);

//by id
router.get("/:id", getProductById);
router.put("/:id", editProduct);
router.delete("/:id", deleteProduct);
router.put("/gallery-images/:id", uploadOptions.array("images", 5), editGalleryImages);
router.put("/product-image/:id", uploadOptions.single("image"), editProductImage);

//featuredProducts

export default router;
