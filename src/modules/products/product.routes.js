import { Router } from "express";
import { auth , validRoles } from "../../../middleware/auth.js";
import { headers } from "../../utils/generalField.js";
import { validation } from "../../../middleware/validation.js";
import { multerCloudinary } from "../../../services/multer.js";
import * as PV from "./product.validation.js";
import * as PC from "./product.controller.js";
import reviewRouter from "../review/review.routes.js";


const productRouter = Router({mergeParams : true})


productRouter.use("/:productId/review" , reviewRouter)

productRouter.post(
    "/addProduct" ,
    validation(headers.headers),
    auth([...validRoles.Admin , ...validRoles.User]),
    multerCloudinary().array("images"),
    validation(PV.addProduct),
    PC.addProduct
)


productRouter.patch(
    "/update/:productId" ,
    validation(headers.headers),
    auth([...validRoles.Admin , ...validRoles.User]),
    multerCloudinary().array("images"),
    validation(PV.updateProduct),
    PC.updateProduct
)





productRouter.patch(
    "/addToWishList/:productId" ,
    validation(headers.headers),
    auth([...validRoles.Admin , ...validRoles.User]),
    validation(PV.addToWishList),
    PC.addToWishList
)


productRouter.patch(
    "/removeFromWishList/:productId" ,
    validation(headers.headers),
    auth([...validRoles.Admin , ...validRoles.User]),
    validation(PV.removeFromWishList),
    PC.removeFromWishList
)

 

productRouter.get("/",
    PC.getProducts
)















export default productRouter