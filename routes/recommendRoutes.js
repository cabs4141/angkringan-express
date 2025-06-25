// routes/recommend.js
import express from "express";
import Order from "../models/orderModels.js";
import Product from "../models/productsModels.js";

import { buildUserProductMatrix, recommendProducts } from "../service/recommenderService.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find();
    const matrix = buildUserProductMatrix(orders);
    const userId = req.params.userId;

    if (!matrix[userId]) {
      return res.status(404).json({ message: "User tidak ditemukan dalam data order." });
    }

    const scored = recommendProducts(userId, matrix, 3); // ← hasil [{product, score}]
    const productIds = scored.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const scoreMap = Object.fromEntries(scored.map((item) => [item.product, item.score]));

    const detailedRecommendations = productIds
      .map((id) => {
        const prod = products.find((p) => p._id.toString() === id);
        if (!prod) return null;
        return {
          _id: prod._id,
          name: prod.name,
          image: prod.image,
          price: prod.price,
          score: scoreMap[id],
        };
      })
      .filter(Boolean);

    res.json({
      userId,
      recommendations: detailedRecommendations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

export default router;
