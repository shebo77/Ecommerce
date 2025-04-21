import multer from "multer";
import { AppError } from "../src/utils/AppError.js";
import { validExtension } from "../src/utils/allowExtension.js";




export const multerCloudinary = (customValidation) => {
  if(!customValidation){
    customValidation = validExtension.image
  }
   

  const storage = multer.diskStorage({})
  const fileFilter = function (req , file , cb){
    if(customValidation.includes(file.mimetype)){
        return cb(null , true)
    }
    cb(new AppError("invalidType" , 400) , false)
  }
  const upload = multer({fileFilter , storage})
  return upload
}