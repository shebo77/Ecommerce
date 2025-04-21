let dataMethod = ["body" , "params" , "query" , "headers" , "file" , "files"]


export const validation = (schema) => {
  return async (req , res , next) => {
    let arrErrors = []
    dataMethod.forEach((key) => {
      if(schema[key]){
        const {error} = schema[key].validate(req[key] , {abortEarly : false})
        if(error?.details){
            error.details.forEach((e) => {
              arrErrors.push(e.message)
            })
        } 
    
    
    }
    })
    if(arrErrors.length){
        return res.json({err : arrErrors})
    }
    next()
  }
}