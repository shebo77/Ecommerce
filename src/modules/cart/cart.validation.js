import joi from "joi";
import { generalFiled, headers } from "../../utils/generalField.js";



export const createCart = {
    body : joi.object().keys({
        productId : generalFiled.id.required(),
        quantity : joi.number().min(1).required()
    }).required(),
    headers : headers.headers.required()
}




