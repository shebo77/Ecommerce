import joi from"joi";
import { Types } from "mongoose";



const objectIdValidation = (value, helper) => {
    if (!Types.ObjectId.isValid(value)) {
        return helper.message("Invalid ID format");
    }
    return value
}

export const generalFiled = {
    email: joi.string().email({ tlds: { allow: ["net", "com"] }, minDomainSegments: 2 }).required(),
    password: joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/).required(),
    rePassword: joi.string().valid(joi.ref("password")).required(),
    file: joi.object().keys({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required(),
    }),
    id: joi.string().custom(objectIdValidation),
};


// export const headers = {
//     headers: joi.object({
//         'cache-control': joi.string(),
//         'postman-token': joi.string(),
//         'content-type': joi.string(),
//         'content-length': joi.string(),
//         host: joi.string(),
//         'user-agent': joi.string(),
//         accept: joi.string(),
//         'accept-encoding': joi.string(),
//         connection: joi.string(),
//         token: joi.string().required()
//     }).options({ allowUnknown: true }), 

// }

export const headers = {
    headers: joi.object({
      token: joi.string().required(),
    }).options({ allowUnknown: true }).required()
  };
