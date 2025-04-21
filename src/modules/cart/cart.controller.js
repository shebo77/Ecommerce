import cartModel from "../../../db/models/cart.model.js";
import productModel from "../../../db/models/product.model.js";
import { asyncHandler, AppError } from "../../utils/AppError.js";

export const createCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const product = await productModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });
  if (!product) {
    return next(new AppError("product not found or stock is not enough", 400));
  }
  const cartExist = await cartModel.findOne({ userId: req.user._id });
  if (!cartExist) {
    const cart = await cartModel.create({
      userId: req.user._id,
      products: [{ productId, quantity }],
    });
    return res.status(201).json({ msg: "done", cart });
  }
  const cartProduct = cartExist.products.find((p) =>
    p.productId.equals(productId)
  );

  if (cartProduct) {
    if (quantity > product.stock) {
      return next(new AppError(" quantity is greater than the stock", 400));
    }
    cartProduct.quantity = quantity;
  } else {
    cartExist.products.push({ productId, quantity });
  }
  await cartExist.save();
  return res.status(201).json({ msg: "done", cartExist });
});

export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { id } = req.body;
  const {cartId} = req.params
  const cartProduct = await cartModel.findOneAndUpdate(
    {
        "_id" : cartId ,
      "products.productId": id,
      userId: req.user._id,
    },
    { $pull: { products: { productId: { $in: id } } } },
    {new : true}
  );

  cartProduct ? res.status(200).json({msg : "done" , cartProduct}) : next(new AppError("fail" , 500))
});



export const clearCart = asyncHandler(async (req , res , next) => {
  const cart = await cartModel.findOneAndUpdate(
    {userId : req.user._id},
    {products : []},
    {new : true}
  )
  cart ? res.status(200).json({msg : "done" , cart}) : next(new AppError("cart not found" , 404))
})