import { model, Schema, Types } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: [true, "user is required"],
      ref: "user",
    },
    products: [
      {
        title: { type: String, required: true },
        productId: { type: Types.ObjectId, required: true, ref: "product" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
      },
    ],
    subPrice: { type: Number, required: true },
    couponId: { type: Types.ObjectId, ref: "coupon" },
    totalPrice: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "placed",
        "waitPayment",
        "onWay",
        "delivered",
        "rejected",
        "canceled",
      ],
      default: "placed",
    },
    reason: String,
    canceledBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    address: {
      type: String,
      required: true,
    },
    phone: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
);


const orderModel = model("order" , orderSchema)
export default orderModel
