import { asyncHandler } from "./AppError.js"




export const rollBackDeleteFromDB =asyncHandler(async (req , res , next) => {
  if(req.savedDocument){
    const{model , id} = req.savedDocument
    await model.findOneAndDelete({_id : id})
  }
  })