import joi from"joi";
import { generalFiled } from "../../utils/generalField.js";


export const createBrand = {
    body : joi.object().keys({
        name : joi.string().min(2).max(15).required(),
        slug : joi.string().min(2).max(15)
    }).required(),
    file : generalFiled.file.required(),
    params : joi.object().keys({
        categoryId : generalFiled.id.required(),
        subCategoryId : generalFiled.id.required(),
    })
}




export const updateBrand = {
    body : joi.object().keys({
        name : joi.string().min(2).max(15),
    }).required(),
    file : generalFiled.file,
    params : joi.object().keys({
        id : generalFiled.id.required(),
        categoryId : generalFiled.id.required(),
        subCategoryId : generalFiled.id.required(),
    })
}