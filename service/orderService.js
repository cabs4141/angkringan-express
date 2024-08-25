import mongoose from "mongoose";
import Cart from "../models/cartModels.js";
import Order from "../models/orderModels.js";

export const addOrders = async (req, res) => {
  const cartIds = Promise.all(
    req.body.cart.map(async (cartItems) => {
      let newCarts = new Cart({
        quantity: cartItems.quantity,
        product: cartItems.product,
      });
      newCarts = await newCarts.save();
      return newCarts._id;
    })
  );
  const cartIdsResolved = await cartIds;
  const totalPrices = await Promise.all(
    cartIdsResolved.map(async (orderItemId) => {
      const orderItem = await Cart.findById(orderItemId).populate("product", "price");
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let orders = new Order({
    cart: cartIdsResolved,
    user: req.body.user,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    postalCode: req.body.postalCode,
    city: req.body.city,
    phone: req.body.phone,
    orderStatus: req.body.orderStatus,
    totalPrice: totalPrice,
    dateOrdered: req.body.dateOrdered,
  });

  try {
    orders = await orders.save();
    if (!orders) {
      return res.status(404).json({ message: "no order found" });
    }
    res.status(200).json({ message: "success", data: orders });
  } catch (err) {
    res.status(200).json({ message: "fail to fetch order", error: err.message });
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
