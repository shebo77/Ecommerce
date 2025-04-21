import { Router } from "express";
import * as OV from "./order.validation.js";
import * as OC from "./order.controller.js";
import { headers } from "../../utils/generalField.js";
import { auth, validRoles } from "../../../middleware/auth.js";
import { validation } from "../../../middleware/validation.js";


const orderRouter = Router()


orderRouter.post(
    "/makeOrder" ,
    validation(headers.headers),
    auth([...validRoles.Admin , ...validRoles.User]),
    validation(OV.createOrder),
    OC.createOrder
)


orderRouter.put(
    "/cancel/:orderId",
    validation(headers.headers),
    auth([...validRoles.Admin , ...validRoles.User]),
    validation(OV.cancelOrder),
    OC.cancelOrder
)














export default orderRouter