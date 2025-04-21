import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";
import reviewModel from "../../../db/models/review.model.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";

export const createReview = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { orderId, userId, rate, comment } = req.body;

  // check product
  const product = await productModel.findOne({ _id: productId });
  if (!product) {
    return next(new AppError("product not found", 404));
  }

  // check order

  const order = await orderModel.findOne({
    _id: orderId,
    userId: req.user._id,
    "products.productId": productId,
    status: "delivered",
  });

  if (!order) {
    return next(new AppError("U should make order first", 404));
  }

//   //check review

//   const reviewExist = await reviewModel.findOne({
//     userId: req.user._id,
//     productId,
//     orderId,
//   });

//   if (reviewExist) {
//     return next(new AppError("already review it before", 400));
//   }

  const review = await reviewModel.create({
    orderId,
    userId,
    rate,
    comment,
    userId: req.user._id,
    productId,
  });

 let sum = product.avgRate * product.rateNum
 sum = sum + review.rate
 product.avgRate = sum / (product.rateNum + 1)
 product.rateNum += 1
  await product.save()

  review
    ? res.status(200).json({ msg: "done", review })
    : next(new AppError("fail", 500));
});






export const removeReview = asyncHandler(async (req, res, next) => {
    const { productId , reviewId } = req.params;

  
    // check product
    const product = await productModel.findOne({ _id: productId });
    if (!product) {
      return next(new AppError("product not found", 404));
    }
  
   
    //check review
  
    const review = await reviewModel.findOneAndDelete({
      userId: req.user._id,
      productId,
      _id : reviewId,
    });
  
    if (!review) {
      return next(new AppError("review not exist", 404));
    }
  
 
   let sum = product.avgRate * product.rateNum
   sum = sum - review.rate
   product.avgRate = sum / (product.rateNum - 1)
   product.rateNum -= 1
    await product.save()
  
    review
      ? res.status(200).json({ msg: "done" })
      : next(new AppError("fail", 500));
  });
