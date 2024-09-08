import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  cart: [
    {
      user: { type: String, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shippingAddress1: {
    type: String,
    required: true,
  },

  // city: {
  //   type: String,
  //   required: true,
  // },
  // postalCode: {
  //   type: String,
  //   required: true,
  // },
  phone: {
    type: String,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Pending",
  },
  totalPrice: {
    type: Number,
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", { virtuals: true });
const Order = mongoose.model("Order", orderSchema);

export default Order;
