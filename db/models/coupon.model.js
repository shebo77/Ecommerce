import { model  , Schema , Types} from "mongoose";



const couponSchema = new  Schema({
    code : {
        type : String,
        required : [true , "code is required"],
        unique : [true , "code is unique"],
        lowercase : true ,
        minLength : 2 ,
        maxLength : 30 ,
        trim : true
    },
    createdBy : {
        type : Types.ObjectId,
        required : [true ,'the owner is required'],
        ref : "user"
    },
    amount : {
        type : Number,
        required : [true , "amount is required"],
    },

    amountType: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
      },

      maxUsage: {
        type: Number,
        default: null,
      },

    fromDate : {
        type : Date,
        required : true
    },
    toDate : {
        type : Date,
        required : true ,
        index: { expires: 0 }
    },
    usedBy : [{
        type : Types.ObjectId,
        ref : "user"
    }]
},{
    timestamps : true
})



const couponModel = model("coupon" , couponSchema)

export default couponModel
