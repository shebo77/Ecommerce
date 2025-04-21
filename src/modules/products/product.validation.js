import joi from "joi";
import { generalFiled, headers } from "../../utils/generalField.js";

export const addProduct = {
  body: joi
    .object()
    .keys({
      title: joi.string().min(2).max(30).required(),
      slug: joi.string().min(2).max(30),
      price: joi.number().min(1).required(),
      discount: joi.number().min(1).max(100),
      stock: joi.number().required(),
    })
    .required(),
  files: joi.array().items(generalFiled.file.required()).required(),
  params: joi.object().keys({
    brandId: generalFiled.id.required(),
    categoryId: generalFiled.id.required(),
    subCategoryId: generalFiled.id.required(),
  }),
};

export const updateProduct = {
  body: joi
    .object()
    .keys({
      title: joi.string().min(2).max(100),
      price: joi.number().min(1),
      discount: joi.number().min(1).max(100),
      stock: joi.number().min(1),
    })
    .required(),
  files: joi.array().items(generalFiled.file),
  params: joi
    .object()
    .keys({
      productId: generalFiled.id.required(),
      subCategoryId: generalFiled.id,
      brandId: generalFiled.id,
      categoryId: generalFiled.id,
    })
    .required(),
};

export const addToWishList = {
  params: joi.object().keys({
    productId: generalFiled.id.required(),
    subCategoryId: generalFiled.id,
    brandId: generalFiled.id,
    categoryId: generalFiled.id,
  }),
  headers: headers.headers.required(),
};

export const removeFromWishList = {
  params: joi.object().keys({
    productId: generalFiled.id.required(),
    subCategoryId: generalFiled.id,
    brandId: generalFiled.id,
    categoryId: generalFiled.id,
  }),
  headers: headers.headers.required(),
};
