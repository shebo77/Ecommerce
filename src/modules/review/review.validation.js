import joi from "joi"
import { generalFiled, headers } from "../../utils/generalField.js"



export const createReview = {
    body : joi.object().keys({
        orderId : generalFiled.id.required(),
        comment : joi.string().min(1).max(500).required(),
        rate : joi.number().min(1).max(5).required()
    }).required(),
    params : joi.object().keys({
        productId : generalFiled.id.required()
    }).required(),
    headers : headers.headers.required(),
}