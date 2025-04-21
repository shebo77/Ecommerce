import joi  from "joi";
import { generalFiled  , headers} from "../../utils/generalField.js";



export const createCoupon = {
    body : joi.object().keys({
        code : joi.string().min(3).max(30).required(),
        amount : joi.number().min(1).max(100).required(),
        amountType : joi.string().valid("percentage", "fixed").required(),
        fromDate : joi.date().greater(Date.now()-(24*60*60*1000)).required(),
        toDate : joi.date().greater(joi.ref("fromDate")).required(),
        maxUsage : joi.number().min(1).optional()
    }).required(),
    headers : headers.headers.required()
}





export const updateCoupon = {
    body : joi.object().keys({
        amount : joi.number().min(1).max(100),
        amountType : joi.string().valid("percentage", "fixed"),
        fromDate : joi.date().greater(Date.now()-(24*60*60*1000)),
        toDate : joi.date().greater(joi.ref("fromDate")),
        maxUsage : joi.number().min(1).optional()
    }),
    headers : headers.headers.required()
}