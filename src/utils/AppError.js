export class AppError extends Error {
    constructor(message , statusCode){
        super(message)
        this.statusCode = statusCode
    }
}


export const asyncHandler = (fn) => {
  return (req , res , next)=>{
    fn(req , res , next).catch((err)=>{
        next(err)
    })
  }
}




export const globalErrorHandling = (err , req , res , next) => {
  if(process.env.MODE == "dev"){
    devMode(err , res)
  }else{
    prodMode(err , res)
  }
}



const prodMode = (err , res ) => {
  let statusCode = err.statusCode || 500
  return res.status(statusCode).json({
    err : err.message ,
    statusCode : statusCode
  })
}





const devMode = (err , res ) => {
    let statusCode = err.statusCode || 500
    return res.status(statusCode).json({
      err : err.message ,
      statusCode : statusCode,
      stack : err.stack
    })
  }