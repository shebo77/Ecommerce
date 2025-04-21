import jwt from "jsonwebtoken";
import userModel from "../../../db/models/user.model.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";
import bcrypt from "bcrypt"
import { emailFunc } from "../../../services/sendEmail.js";
import  {nanoid}  from "nanoid";


export const signUp = asyncHandler(async(req , res , next) => {
  const {name , email , password , address , phoneNumber , age} = req.body
  const exist = await userModel.findOne({email : email.toLowerCase()})
  if(exist){
    return next(new AppError("email already exist" , 409))
  }
  const token = jwt.sign({email} ,process.env.SIGNATURE , {expiresIn : 60*2} )
  const link = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`
  const rfToken = jwt.sign({ email }, process.env.SIGNATURE)
  const rfLink = `${req.protocol}://${req.headers.host}/auth/refreshToken/${rfToken}`
  const emailSend = emailFunc({
      email,
      subject: "confirm email",
      html: `<a href='${link}'>confirm email</a> <br>
      <a href='${rfLink}'>resend confirmEmail</a>`
  })
    if(!emailSend){
      return next(new AppError("failed to send this email" , 400))
    }

const hash = bcrypt.hashSync(password , +process.env.SaltRounds)
const user = await userModel.create( {name , email , password : hash , address , phoneNumber , age})
user ? res.status(201).json({msg : "done" , user}) : next(new AppError("fail" , 500))
})




export const confirmEmail = asyncHandler(async(req , res , next) => {
  const {token} = req.params
   
  const decoded = jwt.verify(token ,process.env.SIGNATURE)
  if(!decoded?.email){
    return next(AppError("invalid token" , 404))
  }

  const user = await userModel.findOneAndUpdate({email : decoded.email , confirmed : false} , {confirmed : true} , {new : true})

user ? res.status(201).json({msg : "done"}) : next(new AppError("user not exist or already confirmed" , 400))
})



export const refreshToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params
  const decoded = jwt.verify(token, process.env.SIGNATURE)
  if (!decoded?.email) {
      return next(new AppError("invalid token", 400))
  }
  const user = await userModel.findOne({ email: decoded.email, confirmed: false })
  if (!user) {
      return next(new AppError("user not exist or already  confirmed plz log in", 400))
  }
  const rfToken = jwt.sign({ email: user.email }, process.env.SIGNATURE, { expiresIn: 60 * 2 })
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${rfToken}`
  const emailSend = emailFunc({
      email: user.email,
      subject: "confirm email",
      html: `<a href='${link}'>confirm email</a> `
  })
  if (!emailSend) {
      return next(new AppError("fail to send this email", 400))

  }
  res.status(201).json({ msg: "done" })

})




export const forgetPassword = asyncHandler(async (req , res , next) => {
  const {email} = req.body
  const user = await userModel.findOne({email})
  if(!user){
    return next(new AppError("user not exist" ,400))

  }

  const code = nanoid(5)
  const emailSend = emailFunc({
    email , 
    subject : "reset password",
    html : `<h1>code : ${code}</h1>`
  })
  if (!emailSend) {
    return next(new AppError("fail to send this email", 400))

}
  await userModel.updateOne({email} , {forgetCode : code})
  res.status(200).json({msg : "done"})

})


export const resetPassword = asyncHandler(async (req , res , next) => {
  const {email , code , newPassword , rePassword} = req.body
  const user = await userModel.findOne({email})
  if(!user){
    return next(new AppError("user not exist" , 404))

  }
  if(user.forgetCode!== code){
    return next(new AppError("invalid code" , 400))
  }
  const hash = bcrypt.hashSync(newPassword , +process.env.SaltRounds)
  await userModel.updateOne({email} , {password : hash , forgetCode : "" , changePasswordAt : Date.now()})
  res.status(200).json({msg : "done"})
})





export const signIn = asyncHandler(async (req , res ,next) => {
  const {email , password} = req.body
  const user = await userModel.findOne({email})
  if(!user){
    return next(new AppError("user not exist" , 404))
  }
  if(user.confirmed == false){
    return next(new AppError("user not confirmed" , 404))
  }
  const match = bcrypt.compareSync(password , user.password)
  if(!match){
    return next(new AppError("password not match" , 400))
  }
const token = jwt.sign({id : user._id , email , role : user.role} ,process.env.SIGNATURE )
  await userModel.updateOne({email} , {loggedIn : true})
  return res.status(200).json({msg : "done" , token})
})
