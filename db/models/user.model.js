import { model , Schema, Types } from "mongoose";

const userSchema = new Schema({
    name : {
        type : String ,
        required : [true , "name is required"],
        minLength : 2,
        maxLength : 15,
        trim : true
    },
    email : {
        type : String ,
        required : [true , "email is required"],
        unique : [true , "email is unique"],
        trim : true,
        lowercase : true

    },
    password : {
        type : String,
        required : [true , "password is required"]
    },
    age : {
        type : Number
    },
    role : {
        type : String,
        enum : ["User" , "Admin"],
        default : "User"
    },
    // verifyEmail : {
    //     type : Boolean,
    //     default : false
    // },
    phoneNumber : {
        type : String,
        required : true,
    },
    address : {
        type : String,
        required : true
    },
    loggedIn : {
        type : Boolean,
        default : false
    },
    forgetCode : {
        type : String
        
    },
    changePasswordAt : {
        type : Date
        
    },

    confirmed : {
        type : Boolean,
        default : false
    },

    wishList : [{
        type : Types.ObjectId,
        ref : "product"
    }]

},{
    timestamps : true
})



const userModel = model("user" , userSchema)
export default userModel