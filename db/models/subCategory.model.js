import { model, Model , Schema , Types } from "mongoose";



const subCategorySchema = new Schema({
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
    image : {
        type : Object
    },
    customId : {
        type : String
    }
},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true},
    timestamps : true
})

subCategorySchema.virtual("brand" , {
    ref : "brand" , 
    localField : "_id",
    foreignField : "subCategoryId"
})


const subCategoryModel = model("subCategory" , subCategorySchema)
export default subCategoryModel