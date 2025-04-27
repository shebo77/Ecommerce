import joi from "joi";
import { generalFiled, headers } from "../../utils/generalField.js";

export const createOrder = {
  body: joi
    .object()
    .keys({
      productId: generalFiled.id,
      quantity: joi.number().min(1),
      phone: joi
        .array()
        .items(
          joi
            .string()
            .pattern(/^01[0125][0-9]{8}$/)
            .required()
        )
        .min(1)
        .required(),
      address: joi.string().required(),
      paymentMethod: joi.string().valid("cash", "card").required(),
      couponCode: joi.string(),
    })
    .with("productId", "quantity")
    .required(),
  headers: headers.headers.required(),
};

export const cancelOrder = {
  params: joi
    .object()
    .keys({
      orderId: generalFiled.id.required(),
    })
    .required(),
  body: joi.object().keys({
    reason: joi.string(),
  }),

  headers: headers.headers.required(),
};
