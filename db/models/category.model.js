import { model, Schema, Types } from "mongoose";



const categorySchema = new Schema({
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
        trim : true,
    },
    image : {
        type : Object
    },
    customId : {
        type : String
    }
},{
    toJSON :{virtuals:true},
    toObject:{virtuals:true},
    timestamps : true
})


categorySchema.virtual("subcategory",{
    ref:"subCategory",
    localField:"_id",
    foreignField:"categoryId"
})

const categoryModel = model("category" , categorySchema)
export default categoryModel