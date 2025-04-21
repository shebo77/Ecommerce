import { Router } from "express";
import { validation } from "../../../middleware/validation.js";
import { headers } from "../../utils/generalField.js";
import { auth, validRoles } from "../../../middleware/auth.js";
import { multerCloudinary } from "../../../services/multer.js";
import * as BV from "./brand.validation.js";
import * as BC from "./brand.controller.js";
import productRouter from "../products/product.routes.js";

const brandRouter = Router({mergeParams : true})

brandRouter.use("/:brandId/product" , productRouter)

brandRouter.post(
    "/addBrand",
    validation(headers.headers),
    auth(validRoles.Admin),
    multerCloudinary().single("image"),
    validation(BV.createBrand),
    BC.createBrand
    
)



brandRouter.put(
    "/updateBrand/:id",
    validation(headers.headers),
    auth(validRoles.Admin),
    multerCloudinary().single("image"),
    validation(BV.updateBrand),
    BC.updateBrand
)












export default brandRouter