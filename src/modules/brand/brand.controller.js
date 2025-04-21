import slugify from "slugify";
import brandModel from "../../../db/models/brand.model.js";
import categoryModel from "../../../db/models/category.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";




//*****************************create brand*********************************** */

export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryId, subCategoryId} = req.params
  
  const category = await categoryModel.findOne({ _id: categoryId });
  if (!category) {
    return next(new AppError("category not exist", 404));
  }

  const subCategory = await subCategoryModel.findOne({ _id: subCategoryId });

  if (!subCategory) {
    return next(new AppError("subCategory not exist", 404));
  }

  const brandExist = await brandModel.findOne({ name: name.toLowerCase() });
  if (brandExist) {
    return next(new AppError("brand already exist", 400));
  }

  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  if (!req.file) {
    return next(new AppError("image is required", 400));
  }
  const customId = nanoid(4);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce/categories/${category.customId}/SubCategories/${subCategory.customId}/brands/${customId}`,
    }
  );

  const brand = await brandModel.create({
    name,
    categoryId,
    subCategoryId,
    slug,
    customId,
    image: { secure_url, public_id },
    addedBy: req.user._id,
  });

  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    return next(new AppError("fail", 500));
  }

  return res.status(201).json({ msg: "done", brand });
});




//*********************************update brand********************************* */

export const updateBrand = asyncHandler(async (req, res, next) => {
  const { name} = req.body;
  const { id ,  categoryId, subCategoryId} = req.params;

  const category = await categoryModel.findOne({ _id: categoryId });
  if (!category) {
    return next(new AppError("category not exist", 404));
  }

  const subCategory = await subCategoryModel.findOne({ _id: subCategoryId });

  if (!subCategory) {
    return next(new AppError("subCategory not exist", 404));
  }

  const brand = await brandModel.findOne({
    _id: id,
    categoryId,
    subCategoryId,
    addedBy: req.user._id,
  });

  if (!brand) {
    return next(new AppError("brand not exist or u are not the owner", 404));
  }

  if (name) {
    if (brand.name == name.toLowerCase()) {
      return next(new AppError("name match the old name", 400));
    }
    if (await brandModel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("brand already exist", 400));
    }
    brand.name = name.toLowerCase();
    brand.slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(brand.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Ecommerce/categories/${category.customId}/SubCategories/${subCategory.customId}/brands/${brand.customId}`,
      }
    );
    brand.image = { secure_url, public_id };
  }

  if (name || req.file) {
    await brand.save();
    return res.json({ msg: "done", brand });
  } else {
    return next(new AppError("fail", 500));
  }
});




