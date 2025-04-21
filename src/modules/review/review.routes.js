import { Router } from "express";
import { validation } from "../../../middleware/validation.js";
import { headers } from "../../utils/generalField.js";
import { auth, validRoles } from "../../../middleware/auth.js";
import * as RV from "./review.validation.js";
import * as RC from "./review.controller.js";

const reviewRouter = Router({ mergeParams: true });

reviewRouter.post(
  "/",
  validation(headers.headers),
  auth([...validRoles.Admin, ...validRoles.User]),
  validation(RV.createReview),
  RC.createReview
);

reviewRouter.delete(
  "/:reviewId",
  validation(headers.headers),
  auth([...validRoles.Admin, ...validRoles.User]),
  RC.removeReview
);

export default reviewRouter;
