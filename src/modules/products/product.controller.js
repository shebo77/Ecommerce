import slugify from "slugify";
import productModel from "../../../db/models/product.model.js";
import { AppError, asyncHandler } from "../../utils/AppError.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import categoryModel from "../../../db/models/category.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import brandModel from "../../../db/models/brand.model.js";
import userModel from "../../../db/models/user.model.js";
import ApiFeatures from "../../utils/apiFeatures.js";

export const addProduct = asyncHandler(async (req, res, next) => {
  const { title, price, discount, stock } = req.body;
  const { brandId, categoryId, subCategoryId } = req.params;
  const categoryExist = await categoryModel.findById(categoryId);
  if (!categoryExist) {
    return next(new AppError("category not exist ", 404));
  }
  const subCategoryExist = await subCategoryModel.findById(subCategoryId);
  if (!subCategoryExist) {
    return next(new AppError("subCategory not exist ", 404));
  }
  const brandExist = await brandModel.findById(brandId);
  if (!brandExist) {
    return next(new AppError("brand not exist ", 404));
  }
  const slug = slugify(title, {
    replacement: "_",
    lower: true,
  });
  if (!req.files) {
    return next(new AppError("images are required", 400));
  }
  let customId = nanoid(4);
  let arr = [];
  let arrIds = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `Ecommerce/categories/${categoryExist.customId}/SubCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${customId}`,
      }
    );
    arr.push({ secure_url, public_id });
    arrIds.push(public_id);
  }

  let priceAfterDiscount = price - price * (discount || 0 / 100);

  const product = await productModel.create({
    title,
    price,
    discount,
    slug,
    stock,
    brandId,
    categoryId,
    subCategoryId,
    priceAfterDiscount,
    addedBy: req.user._id,
    images: arr,
    customId,
  });

  if (!product) {
    await cloudinary.api.delete_resources(arrIds);
    return next(new AppError("fail to add product", 500));
  }
  return res.status(200).json({ msg: "done", product });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { productId, categoryId, subCategoryId, brandId } = req.params;
  const { price, discount, stock } = req.body;

  let category, subCategory, brand, product;

  if (categoryId) {
    category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(new AppError("category not exist", 404));
    }
  }

  if (subCategoryId) {
    subCategory = await subCategoryModel.findById(subCategoryId);
    if (!subCategory) {
      return next(new AppError("subCategory not exist", 404));
    }
  }

  if (brandId) {
    brand = await brandModel.findById(brandId);
    if (!brand) {
      return next(new AppError("brand not exist", 404));
    }
  }

  if (productId) {
    product = await productModel.findOne({
      _id: productId,
      addedBy: req.user._id,
    });
    if (!product) {
      return next(
        new AppError("product not exist or U are not the owner", 404)
      );
    }
  }

  if (price && discount) {
    product.price = price;
    product.discount = discount;
    product.priceAfterDiscount = price - price * (discount / 100);
  } else if (price) {
    product.price = price;
    product.priceAfterDiscount = price - price * (product.discount / 100);
  } else if (discount) {
    product.discount = discount;
    product.priceAfterDiscount =
      product.price - product.price * (discount / 100);
  }
  if (stock) {
    product.stock = stock;
  }

  let newImgs = [];
  let newPublicIds = [];
  if (req.files) {
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `Ecommerce/categories/${category.customId}/SubCategories/${subCategory.customId}/brands/${brand.customId}/products/${product.customId}`,
        }
      );
      newImgs.push({ secure_url, public_id });
      newPublicIds.push({ public_id });
    }
    if (newImgs.length === req.files.length) {
      let oldPublicIds = product.images.map((img) => img.public_id);
      if (oldPublicIds.length > 0) {
        await cloudinary.api.delete_resources(oldPublicIds);
      }
      product.images = newImgs;
    } else {
      await cloudinary.api.delete_resources(newPublicIds);
      return next(new AppError("fail to upload all images", 500));
    }
  }

  await product.save();

  return res.status(200).json({ msg: "done", product });
});

//*******************************add to wishList********************************** */

export const addToWishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // check product

  const product = await productModel.findById({ _id: productId });
  if (!product) {
    return next(new AppError("product not exist", 404));
  }

  const user = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    { $addToSet: { wishList: product._id } },
    { new: true }
  );
  user
    ? res.status(200).json({ msg: "done", user })
    : next(new AppError("fail", 500));
});

//**************************removeFromWishList****************************** */

export const removeFromWishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // check product

  const product = await productModel.findById({ _id: productId });
  if (!product) {
    return next(new AppError("product not exist", 404));
  }

  const user = await userModel.findOneAndUpdate(
    {
      _id: req.user._id,
      wishList: { $in: [productId] },
    },
    { $pull: { wishList: product._id } },
    { new: true }
  );
  user
    ? res.status(200).json({ msg: "done", user })
    : next(new AppError("fail", 500));
});

//********************************get products******************************* */

export const getProducts = asyncHandler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(productModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .select()
    .search(["title", "slug"]);


  const products = await apiFeatures.mongooseQuery;

  res.status(200).json({ msg: "done", page : apiFeatures.page, products });
});
