
import { AppError, asyncHandler } from "../../utils/AppError.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import categoryModel from "../../../db/models/category.model.js";



//************************************create sub category********************************** */

export const createSubCategory = asyncHandler(async(req , res , next) => {
const {name} = req.body
const {categoryId} = req.params
const category = await categoryModel.findById({_id : categoryId})
if(!category){
  return next(new AppError("category not exist" , 404))
}
const SubCategoryExist = await subCategoryModel.findOne({
  name : name.toLowerCase()
})
if(SubCategoryExist){
  return next(new AppError("sub category already exist" , 400))
}
const slug = slugify(name , {
  replacement : "_",
  lower : true,
})
if(!req.file){
  return next(new AppError("image is required" , 400))
}
const customId = nanoid(4)
const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
  folder : `Ecommerce/categories/${category.customId}/SubCategories/${customId}`

})
const subCategory = await subCategoryModel.create({
  name , 
  slug ,
   image : {secure_url , public_id},
   categoryId ,
   customId,
    addedBy : req.user._id
})

if(!subCategory){
  await cloudinary.uploader.destroy(public_id)
  return next(new AppError("fail" , 500))
}
return res.status(200).json({msg : "done"  , subCategory})

})














//************************************update subcategory********************************** */
export const updateSubCategory = asyncHandler(async (req , res , next) => {
  const {id , categoryId} = req.params
  const {name} = req.body

const category = await categoryModel.findOne({_id : categoryId})

if(!category){
  return next(new AppError("category not exist" , 404))
}


const subCategory = await subCategoryModel.findOne({
  _id : id,
  categoryId,
  addedBy : req.user._id

})
if(!subCategory){
  return next(new AppError("subCategory not exist or u are not the owner" , 404))
}

if(name){
  if(subCategory.name == name.toLowerCase()){
    return next(new AppError("name match the old name" , 400))
  }
  if(await subCategoryModel.findOne({name : name.toLowerCase()})){
    return next(new AppError("subCategory already exist" , 400))
  }
  subCategory.name = name.toLowerCase()
  subCategory.slug = slugify(name , {
    replacement : "_",
    lower : true
  })

}


if(req.file){
  await cloudinary.uploader.destroy(subCategory.image.public_id)
  const{secure_url , public_id}=await cloudinary.uploader.upload(req.file.path , {
  folder : `Ecommerce/categories/${category.customId}/SubCategories/${subCategory.customId}`
  })
  subCategory.image = {secure_url , public_id}
}

if (name || req.file) {
  await subCategory.save()  
  return res.status(200).json({ msg: "done", subCategory })
} else {
  return next(new AppError("No updates were made", 400))
}


})










