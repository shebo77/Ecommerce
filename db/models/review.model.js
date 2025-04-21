import { Schema, model, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "user",
      required: [true, "userId is required"],
    },
    productId: {
      type: Types.ObjectId,
      ref: "product",
      required: [true, "productId is required"],
    },
    orderId: {
      type: Types.ObjectId,
      ref: "order",
      required: [true, "orderId is required"],
    },
  },
  {
    timestamps: true,
  }
);



const reviewModel = model("review" , reviewSchema)
export default reviewModel
