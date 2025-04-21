import { Router } from "express";
import * as CC from "./category.controller.js";
import { auth, validRoles } from "../../../middleware/auth.js";
import { multerCloudinary } from "../../../services/multer.js";
import { validation } from "../../../middleware/validation.js";
import * as CV from "./category.validation.js";
import { headers } from "../../utils/generalField.js";
import subCategoryRouter from "../subCategory/subCategory.routes.js";

const categoryRouter = Router();

categoryRouter.use("/:categoryId/subCategory" , subCategoryRouter)



categoryRouter.post(
  "/create",
  validation(headers.headers),
  auth(validRoles.Admin),
  multerCloudinary().single("image"),
  validation(CV.createCategory),
  CC.createCategory
);

categoryRouter.put(
  "/update/:id",
  validation(headers.headers),
  auth(validRoles.Admin),
  multerCloudinary().single("image"),
  validation(CV.updateCategory),
  CC.updateCategory
);


categoryRouter.get("/",CC.getCategories)


categoryRouter.delete(
  "/delete/:id",
  auth(validRoles.Admin),
  validation(CV.deleteCategory),
  CC.deleteCategory
)

export default categoryRouter;
