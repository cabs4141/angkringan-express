import Cart from "../models/cartModels.js";
import mongoose, { isValidObjectId } from "mongoose";

export const getCart = async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await Cart.find({ user: id }).populate("product");
    if (!cart) {
      return res.status(404).json({ message: "cart not found" });
    }
    res.status(200).json({ message: "success", data: cart });
  } catch (error) {
    res.status(500).json({ message: "server error:", error: error.message });
  }
};

export const getCartDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await Cart.findOne(id);
    if (!cart) {
      return res.status(404).json({ message: "cart not found" });
    }
    res.status(200).json({ message: "success", data: cart });
  } catch (error) {
    res.status(500).json({ message: "server error:", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  const { userId, quantity, productId } = req.body;
  try {
    const existCart = await Cart.findOne({ user: userId, product: productId });
    if (existCart) {
      existCart.quantity += quantity;
      await existCart.save();
    } else {
      const newCart = new Cart({
        user: userId,
        product: productId,
        quantity: quantity,
      });
      await newCart.save();
    }
    res.status(201).json({ message: "success add to cart" });
  } catch (error) {
    return res.status(500).json({ message: "server error", error: error.message });
  }
};

// Express route untuk update quantity item di keranjang
// router.put('/cart/:id',
// Backend service
// Backend service
export const editQty = async (req, res) => {
  const { id } = req.params;
  const { quantity, user, product } = req.body; // Pastikan `user` dan `product` ada

  try {
    const cartItem = await Cart.findById(id);
    if (cartItem) {
      cartItem.quantity = quantity;
      cartItem.user = user; // Update field user jika diperlukan
      cartItem.product = product; // Update field product jika diperlukan
      await cartItem.save();
      res.status(200).json({ message: "success add qty", data: cartItem });
    } else {
      res.status(404).json({ message: "Item tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui cart item", error: error.message });
  }
};

export const deleteCartItems = async (req, res) => {
  const { ids } = req.body; // menerima array dari ID item yang akan dihapus

  // Validasi apakah ids adalah array
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No IDs provided or invalid data format" });
  }

  // Memeriksa apakah semua id valid
  const invalidIds = ids.filter((id) => !mongoose.isValidObjectId(id));
  if (invalidIds.length > 0) {
    return res.status(400).json({ error: "Some IDs are invalid", invalidIds });
  }

  try {
    const deletedItems = await Cart.deleteMany({ _id: { $in: ids } });

    if (deletedItems.deletedCount === 0) {
      return res.status(404).json({ message: "No items found to delete" });
    }

    res.status(200).json({ message: `Successfully deleted ${deletedItems.deletedCount} items`, data: deletedItems });
  } catch (error) {
    return res.status(500).json({ message: "server error", error: error.message });
  }
};
