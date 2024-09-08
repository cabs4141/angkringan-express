import mongoose from "mongoose";
import Cart from "../models/cartModels.js";
import Order from "../models/orderModels.js";
import Product from "../models/productsModels.js";

export const addOrders = async (req, res) => {
  try {
    // 1. Pastikan req.body.cart berisi array yang valid
    if (!req.body.cart || req.body.cart.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    // 2. Hitung total harga berdasarkan item dalam cart
    const totalPrices = await Promise.all(
      req.body.cart.map(async (cartItem) => {
        const product = await Product.findById(cartItem.product);
        const totalPrice = product.price * cartItem.quantity;
        return totalPrice;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    // 3. Buat instance Order baru
    let order = new Order({
      cart: req.body.cart.map((item) => ({
        user: item.user,
        product: item.product,
        quantity: item.quantity,
      })),
      user: req.body.user,
      shippingAddress1: req.body.shippingAddress1,
      postalCode: req.body.postalCode,
      city: req.body.city,
      phone: req.body.phone,
      orderStatus: req.body.orderStatus,
      totalPrice: totalPrice,
      dateOrdered: req.body.dateOrdered || Date.now(),
    });

    // 4. Simpan order ke database
    order = await order.save();

    // 5. Kirim response sukses
    return res.status(201).json({ message: "Order berhasil dibuat", data: order });
  } catch (err) {
    // Handle error dan kirim response gagal
    console.error("Error menambahkan order:", err);
    return res.status(500).json({ message: "Gagal menambahkan order", error: err.message });
  }
};

export const getOrderLists = async (req, res) => {
  try {
    const cartList = await Order.find().populate("user", "username").sort({ dateOrdered: -1 });
    if (!cartList) {
      return res.status(404).json({ message: "no cart found" });
    }
    res.status(200).json({ message: "success", data: cartList });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch cart list", error: error.message });
  }
};

export const getOrderdetails = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid id" });
  }
  try {
    const order = await Order.findById(id)
      .populate("user", "username")
      .populate({ path: "cart", populate: { path: "product", populate: "category" } });
    if (!order) {
      return res.status(404).json({ message: "no cart found" });
    }
    res.status(200).json({ message: "success", data: order });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch cart list", error: error.message });
  }
};

export const editOrders = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId) {
    return res.status(400).json({ message: "invalid id" });
  }
  const { orderStatus } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }
    res.status(200).json({ message: "success", status: orderStatus });
  } catch (error) {
    res.status(500).json({ message: "fail to fetch update status order", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  Order.findByIdAndDelete(id)
    .then(async (order) => {
      if (order) {
        await order.cart.map(async (cartItem) => {
          await Cart.findByIdAndDelete(cartItem);
        });
        return res.status(200).json({ message: "success" });
      } else {
        return res.status(404).json({ message: "order not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "fail to fetch delete order", error: err.message });
    });
};

export const totalSales = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([{ $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }]);
    if (!totalSales) {
      return res.status(400).json({ message: "order sales cannot be generated" });
    }
    res.status(200).json({ message: "success", totalSales: totalSales.pop().totalSales });
  } catch (error) {
    res.status(500).json({ message: "fail to fecth total sales", error: error.message });
  }
};

export const totalOrders = async (req, res) => {
  try {
    const totalOrder = await Order.countDocuments();
    if (!totalOrder) {
      return res.status(404).json({ message: "no order count" });
    }
    res.status(200).json({ message: "success", totalOrder: totalOrder });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};
