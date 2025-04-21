import { asyncHandler } from "./AppError.js"
import cloudinary from "./cloudinary.js"




export const rollBackDeleteFromCloud =asyncHandler(async (req , res , next) => {
    if(req.file){
      await cloudinary.api.delete_resources_by_prefix( req.file)
      await cloudinary.api.delete_folder(req.file)
      
    }
    next()
  })