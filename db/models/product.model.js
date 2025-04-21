import { model, Schema, Types } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      lowercase: true,
      minLength: 2,
      maxLength: 30,
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "slug is required"],
      minLength: 2,
      maxLength: 30,
      trim: true,
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "user",
      required: [true, "addedBy is required"],
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "category",
      required: [true, "categoryId is required"],
    },
    subCategoryId: {
      type: Types.ObjectId,
      ref: "subCategory",
      required: [true, "subCategoryId is required"],
    },
    brandId: {
      type: Types.ObjectId,
      ref: "brand",
      required: [true, "brandId is required"],
    },
    images: [Object],
    customId: String,
    price: {
      type: Number,
      required: [true, "price is required"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    priceAfterDiscount: {
      type: Number,
      required: [true, "priceAfterDiscount is required"],
    },
    stock: {
      type: Number,
      required: [true, "stock is required"],
    },
    avgRate: {
      type: Number,
      default: 0,
    },
    rateNum : {
      type : Number,
      default : 0
    },
  },
  {
    timestamps: true,
  }
);

const productModel = model("product", productSchema);

export default productModel;
