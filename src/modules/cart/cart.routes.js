import { Router } from "express";
import { auth, validRoles } from "../../../middleware/auth.js";
import { validation } from "../../../middleware/validation.js";
import { headers } from "../../utils/generalField.js";
import * as CC from "./cart.controller.js";
import * as CV from "./cart.validation.js";

const cartRouter = Router();

cartRouter.post(
  "/create",
  auth(validRoles.Admin),
  validation(CV.createCart),
  CC.createCart
);




cartRouter.put(
    "/remove/:cartId",
    auth(validRoles.Admin),
    validation(headers.headers),
    CC.removeFromCart
)





cartRouter.put(
    "/remove",
    auth(validRoles.Admin),
    validation(headers.headers),
    CC.clearCart
)



export default cartRouter;
