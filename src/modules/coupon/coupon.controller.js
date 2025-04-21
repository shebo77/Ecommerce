import couponModel from "../../../db/models/coupon.model.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";

export const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, amount, amountType, fromDate, toDate, maxUsage } = req.body;
  const existingCoupon = await couponModel.findOne({ code });
  if (existingCoupon) {
    return next(new AppError("coupon already exist", 400));
  }
  const coupon = await couponModel.create({
    code,
    amount,
    amountType,
    fromDate,
    toDate,
    maxUsage: maxUsage || null,
    createdBy: req.user._id,
  });

  coupon
    ? res.status(201).json({ msg: "done", coupon })
    : next(new AppError("failed", 500));
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;
  const coupon = await couponModel.findOne({
    _id: id,
    createdBy: req.user._id,
  });
  if (!coupon) {
    return next(new AppError("coupon not exist or u are not the creator", 404));
  }
  // if(amount){
  //   coupon.amount = amount
  // }
  // if(amountType){
  //   coupon.amountType = amountType
  // }
  // if(fromDate){
  //   coupon.fromDate = fromDate
  // }
  // if(toDate){
  //   coupon.toDate = toDate
  // }
  // if(maxUsage){
  //   coupon.maxUsage = maxUsage
  // }

  Object.assign(coupon, updateFields);
  await coupon.save();
  return res.status(200).json({ msg: "done", coupon });
});
