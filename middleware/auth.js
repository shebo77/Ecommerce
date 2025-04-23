import jwt from "jsonwebtoken";
import userModel from "../db/models/user.model.js";



 export  let validRoles = {
    User : ["User"],
    Admin : ["Admin"]
}




export const auth = (roles =[]) => {
  return async (req , res , next) => {
    const {token} = req.headers
    if(!token){
        return res.status(404).json({msg : "token not found"})
    }
    if(!token.startsWith(process.env.BEARER_KEY )){
        return res.status(400).json({msg : "invalid token "})
    }
    const baseToken = token.split(process.env.BEARER_KEY)[1]
    const decoded = jwt.verify(baseToken , process.env.SIGNATURE)
    if(!decoded){
        return res.status(404).json({msg : "invalid signature"})
    }
    if(!decoded.id){
        return res.status(400).json({msg : "invalid token payload"})
    }
    const user = await userModel.findById(decoded.id).select("-password")
    if(user?.loggedIn == false){
        return res.status(400).json({msg : "loggedIn first pls"})
    }
    if(!roles.includes(user.role)){
        return res.status(400).json({msg : "not auth"})
    }
  
   
    // if(parseInt(user.changePasswordAt.getTime()/1000) > decoded.iat ){
    //     return res.status(401).json({msg : "token expired"})
    // }
  
    if (user.changePasswordAt && Math.floor(user.changePasswordAt.getTime() / 1000) > decoded.iat) {
        return res.status(401).json({ msg: "token expired" });
      }
    req.user = user
    next()
  }
}

