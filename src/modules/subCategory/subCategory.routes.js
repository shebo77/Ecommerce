import { Router } from "express";
import * as SC from "./subCategory.controller.js";
import { auth, validRoles } from "../../../middleware/auth.js";
import { multerCloudinary } from "../../../services/multer.js";
import { validation } from "../../../middleware/validation.js";
import * as SV from "./subCategory.validation.js";
import { headers } from "../../utils/generalField.js";
import brandRouter from "../brand/brand.routes.js";

const subCategoryRouter = Router({mergeParams : true});

subCategoryRouter.use("/:subCategoryId/brand", brandRouter);  

subCategoryRouter.post(
  "/create",
  validation(headers.headers),
  auth(validRoles.Admin),
  multerCloudinary().single("image"),
  validation(SV.createSubCategory),
  SC.createSubCategory
);

subCategoryRouter.put(
  "/update/:id",
  validation(headers.headers),
  auth(validRoles.Admin),
  multerCloudinary().single("image"),
  validation(SV.updateSubCategory),
  SC.updateSubCategory
)

















export default subCategoryRouter;
