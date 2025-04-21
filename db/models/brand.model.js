import { model, Schema, Types } from "mongoose";




const brandSchema = new Schema({
    name : {
            type : String,
            unique : [true , "category name is unique"],
            trim : true,
            required : [true , "category name is required"],
            maxLength : 30 ,
            minLength : 2,
            lowercase : true
    
        },
        slug : {
            type : String,
            unique : [true , "category name is unique"],
            trim : true,
            required : [true , "category name is required"],
            maxLength : 30 ,
            minLength : 2
    
        },
        addedBy : {
            type  : Types.ObjectId,
            ref : "user",
            required : [true , "email is required"],
        },
        categoryId : {
            type  : Types.ObjectId,
            ref : "category",
            required : [true , "category is required"],
        },

        subCategoryId : {
            type : Types.ObjectId,
            ref : "subCategory" , 
            required : [true , "category is required"]
        },
        image : {
            type : Object
        },
        customId : {
            type : String
        }
},{
    timestamps : true
})



const brandModel = model("brand" , brandSchema)
export default brandModel