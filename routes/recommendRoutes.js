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

    // CASE: Pengguna belum pernah order
    if (!matrix[userId]) {
      // Ambil produk yang paling banyak dibeli secara umum
      const productCount = {};
      orders.forEach((order) => {
        order.cart.forEach((item) => {
          const id = item.product.toString();
          productCount[id] = (productCount[id] || 0) + item.quantity;
        });
      });

      const sortedProductIds = Object.entries(productCount)
        .sort((a, b) => b[1] - a[1]) // urut berdasarkan jumlah terbanyak
        .slice(0, 5) // ambil 5 teratas
        .map(([id]) => id);

      const products = await Product.find({ _id: { $in: sortedProductIds } });

      const detailedRecommendations = sortedProductIds
        .map((id) => {
          const prod = products.find((p) => p._id.toString() === id);
          if (!prod) return null;
          return {
            _id: prod._id,
            name: prod.name,
            image: prod.image,
            price: prod.price,
            alamat: prod.alamat, // skor berdasarkan popularitas
            score: productCount[id], // skor berdasarkan popularitas
          };
        })
        .filter(Boolean);

      return res.json({
        userId,
        recommendations: detailedRecommendations,
        note: "Rekomendasi berdasarkan popularitas karena belum ada riwayat order.",
      });
    }

    // CASE: Pengguna sudah pernah order
    const scored = recommendProducts(userId, matrix, 3);
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
          alamat: prod.alamat, // skor berdasarkan popularitas
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
