import Stripe from "stripe";
import cartModel from "../../../db/models/cart.model.js";
import couponModel from "../../../db/models/coupon.model.js";
import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";
import userModel from "../../../db/models/user.model.js";
import { emailFunc } from "../../../services/sendEmail.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";
import payment from "../../utils/payment.js";
import { createInvoice } from "../../utils/pdf.js";

//------------------------------- create order ----------------------------------//

export const createOrder = asyncHandler(async (req, res, next) => {
  const { productId, quantity, paymentMethod, phone, address } = req.body;
  if (req.body?.couponCode) {
    const coupon = await couponModel.findOne({
      code: req.body.couponCode.toLowerCase(),
      usedBy: { $nin: [req.user._id] },
    });
    if (!coupon) {
      return next(new AppError("coupon not exist or expired"));
    }
    req.body.coupon = coupon;
  }

  let newProducts = [];
  let flag = false;

  if (!req.body.productId) {
    const cart = await cartModel.findOne({ userId: req.user._id });
    if (!cart.products) {
      return next(new AppError("please select products to make order"));
    }
    newProducts = cart.products;
    flag = true;
  } else {
    newProducts = [
      { productId: req.body?.productId, quantity: req.body?.quantity },
    ];
  }

  let ids = [];
  let finalProducts = [];
  let subPrice = 0;
  for (let product of newProducts) {
    const checkProduct = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });
    if (!checkProduct) {
      return next(new AppError("product not exist or quantity is not enough"));
    }
    if (flag) {
      product = product.toObject();
    }

    product.title = checkProduct.title;
    product.price = checkProduct.priceAfterDiscount;
    product.finalPrice = checkProduct.priceAfterDiscount * product.quantity;
    finalProducts.push(product);
    ids.push(product.productId);
    subPrice += product.finalPrice;
  }

  const order = await orderModel.create({
    userId: req.user._id,
    products: finalProducts,
    subPrice,
    couponId: req.body?.coupon?._id,
    totalPrice: subPrice - subPrice * ((req.body?.coupon?.amount || 0) / 100),
    address,
    phone,
    paymentMethod,
    status: paymentMethod == "cash" ? "placed" : "waitPayment",
  });

  // decrease product

  for (const product of finalProducts) {
    await productModel.findOneAndUpdate(
      { _id: product.productId },
      { $inc: { stock: -Number(product.quantity) } },
      { new: true }
    );
  }

  // coupon usedBy
  if (req.body?.couponCode) {
    await couponModel.findOneAndUpdate(
      { _id: req.body?.coupon?._id },
      { $addToSet: { usedBy: req.user._id } },
      { new: true }
    );
  }

  // clear cart
  if (!flag) {
    await cartModel.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { products: { productId: req.body.productId } } },
      { new: true }
    );
  } else {
    await cartModel.findOneAndUpdate(
      { userId: req.user._id },
      { products: [] },
      { new: true }
    );
  }

  //  const invoice = {
  //     shipping: {
  //       name: req.user.name,
  //       address: req.user.address,
  //       city: "cairo",
  //       state: "cairo",
  //       country: "Egypt",
  //       postal_code: 94111
  //     },
  //     items: order.products,
  //     subtotal: subPrice,
  //     paid: order.totalPrice,
  //     invoice_nr: order._id,
  //     date: order.createdAt
  //   };
  //   await createInvoice(invoice, "invoice.pdf");
  //   await emailFunc({
  //     email : req.user.email,
  //     subject : "pdf order",
  //     attachments :[{
  //       path : "invoice.pdf",
  //       contentType : "application/pdf"
  //     }]
  //   })

  if (paymentMethod == "card") {
    const stripe = new Stripe(process.env.stripe_key)

    if (req.body.coupon) {
      const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.amount, duration: "once" })
      req.body.couponId = coupon.id

    }
    const session = await payment({
      stripe,
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      success_url: `${req.protocol}://${req.headers.host}/order/success`,
      cancel_url: `${req.protocol}://${req.headers.host}/order/cancel`,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        }
      }),
      discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : []

    })
    return res.status(201).json({ msg: "done", order, url: session.url });

  }

  return res.status(201).json({ msg: "done", order });
});
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const order = await orderModel.findOne({
    _id: orderId,
    userId: req.user._id,
  });
  if (!order) {
    return next(new AppError(`invalid order with id ${orderId}`, 404));
  }
  if (
    (order?.status != "placed" && order?.paymentMethod == "cash") ||
    (order?.status != "waitPayment" && order?.paymentMethod == "card")
  ) {
    return next(new AppError("can't cancel your order", 400));
  }
  const cancelOrder = await orderModel.updateOne(
    { _id: order._id },
    { canceledBy: req.user._id, status: "cancel", reason }
  );
  if (!cancelOrder) {
    return next(new AppError("fail to cancel this order", 500));
  }

  if (order?.couponId) {
    await couponModel.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: req.user._id } }
    );
  }
  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: product.quantity } }
    );
  }
  res.status(201).json({ msg: "done", cancelOrder });
});












// ********************************** webhook **********************************

export const webhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const stripe = new Stripe(process.env.stripe_key);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Webhook verification failed:", err.message);
    }
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  if (event.type === "checkout.session.completed") {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      if (process.env.NODE_ENV === "development") {
        console.error("No orderId found in metadata");
      }
      return res.status(400).json({ msg: "No orderId in metadata" });
    }

    await orderModel.findByIdAndUpdate(orderId, { status: "placed" });
    
    if (process.env.NODE_ENV === "development") {
      console.log(`Order ${orderId} has been placed successfully.`);
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      console.log(`Unhandled event type ${event.type}`);
    }
  }

  res.status(200).json({ received: true });
});
