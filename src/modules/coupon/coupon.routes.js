import { Router } from "express";
import { validation } from "../../../middleware/validation.js";
import { headers } from "../../utils/generalField.js";
import { auth, validRoles } from "../../../middleware/auth.js";
import * as CV from "./coupon.validation.js";
import * as CC from "./coupon.controller.js";

const couponRouter = Router();

couponRouter.post(
  "/create",
  validation(headers.headers),
  auth([...validRoles.Admin , ...validRoles.User]),
  validation(CV.createCoupon),
  CC.createCoupon
);



couponRouter.put(
  "/update/:id",
  validation(headers.headers),
  auth([...validRoles.Admin , ...validRoles.User]),
  validation(CV.updateCoupon),
  CC.updateCoupon
);


export default couponRouter;
