import path from "path"
import dotenv from "dotenv"
import { dbConnection } from "../db/dbConnection.js"
import { AppError, globalErrorHandling } from "./utils/AppError.js"
import userRouter from "./modules/user/user.routes.js"
import authRouter from "./modules/auth/auth.routes.js"
import { auth, validRoles } from "../middleware/auth.js"
import categoryRouter from "./modules/category/category.routes.js"
import subCategoryRouter from "./modules/subCategory/subCategory.routes.js"
import brandRouter from "./modules/brand/brand.routes.js"
import productRouter from "./modules/products/product.routes.js"
import couponRouter from "./modules/coupon/coupon.routes.js"
import cartRouter from "./modules/cart/cart.routes.js"
import orderRouter from "./modules/orders/order.routes.js"
import reviewRouter from "./modules/review/review.routes.js"
import morgan from "morgan"
import { rollBackDeleteFromCloud } from "./utils/rollBackDeleteFromCloud.js"
import { rollBackDeleteFromDB } from "./utils/rollBackDeleteFromDB.js"
import cors from "cors"
dotenv.config({path : path.resolve("config/.env")})
const port = process.env.PORT 


 
export const initApp = (app , express) => {
  if(process.env.MODE=="dev"){
    app.use(morgan("dev"))
 
  }
  app.use(cors())
    app.use(express.json())
    app.get("/", (req, res) => {
      res.json({msg : "API is working!"});
    });
    app.use("/auth" , authRouter)
    app.use("/users" , userRouter)
    // app.use("/test" , auth(validRoles.User) , (req , res) => {
    //   res.json({msg : "done"})
    // })
    app.use("/category" , categoryRouter)
    app.use("/subCategory" , subCategoryRouter)
    app.use("/brand" , brandRouter)
    app.use("/product" , productRouter)
    app.use("/coupon" , couponRouter)
    app.use("/cart" , cartRouter)
    app.use("/order" , orderRouter)
    app.use("/review" , reviewRouter)

    app.use("*" , (req , res , next) => {
      let err = new AppError(`invalid url oon ${req.originalUrl}` , 404)
      next(err)
    })
  
dbConnection() 
app.use(globalErrorHandling , rollBackDeleteFromCloud , rollBackDeleteFromDB)


    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}