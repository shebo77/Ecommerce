
import { AppError, asyncHandler } from "../../utils/AppError.js";
import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import categoryModel from "../../../db/models/category.model.js";
import subCategoryModel from "../../../db/models/subCategory.model.js";
import brandModel from "../../../db/models/brand.model.js";



//************************************create category********************************** */


export const createCategory = asyncHandler(async(req , res , next) => {
  const {name} = req.body
  const categoryExist = await categoryModel.findOne({
    name : name.toLowerCase()
  })
  if(categoryExist){
    return next(new AppError("category already exist" , 409))
  }

  const slug = slugify(name , {
    replacement : "_",
    lower : true
  })
  const customId = nanoid(4)
  

  const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
    folder : `Ecommerce/categories/${customId}`
  }) 
  req.file = `Ecommerce/categories/${customId}`



  const category = await categoryModel.create({
    name ,
    slug,
    image : {secure_url , public_id},
    customId ,
    addedBy : req.user._id
   })
   req.savedDocument = {model : categoryModel , id : category._id}
   if(!category){
    await cloudinary.uploader.destroy(public_id)
    return next(new AppError("fail" , 500))
   }
   return  res.status(201).json({msg : "done" , category})
})







//************************************update category********************************** */

export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body
  const { id } = req.params

  const category = await categoryModel.findOne({ _id: id, addedBy: req.user._id })
  if (!category) {
    return next(new AppError("Category not exist or you are not the owner", 404))
  }

  if (name) {
    if (name.toLowerCase() === category.name) {
      return next(new AppError("Name matches the old name", 400))
    }
    if (await categoryModel.findOne({ name: name.toLowerCase() })) {
      return next(new AppError("Category already exists", 400))
    }
    category.name = name.toLowerCase()
    category.slug = slugify(name, {
      replacement: "_"
    })
  }

  if (req.file) {
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id)
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: `Ecommerce/categories/${category.customId}`
    })
    category.image = { secure_url, public_id }
  }

  if (name || req.file) {
    await category.save()
    return res.status(200).json({ msg: "done", category })
  } else {
    return next(new AppError("No updates were made", 400))
  }
})




//************************get category with sub categories ************************* */

export const getCategories = asyncHandler(async (req , res , next) => {
  const categories = await categoryModel.find().populate([
    {
      path:"subcategory",
      populate : [{
        path : "brand"
      }]
    }
  ])
  return res.status(200).json({msg : "done"  , categories})
})







//*******************************delete category*********************************** */

export const deleteCategory = asyncHandler(async (req , res , next) => {

//delete from db

  const {id} = req.params
  const category = await categoryModel.findOneAndDelete({
    _id : id,
    addedBy : req.user._id
  })
  if(!category){
    return next(new AppError("category not exist or u are not the owner" , 404))
  }

  const deleteSubCategory = await subCategoryModel.deleteMany({
    categoryId : id
  })
  if(!deleteSubCategory.deletedCount){
    return next(new AppError("subCategory image failed to delete" , 404))
  }

  const deleteBrand = await brandModel.deleteMany({categoryId : id})
  if(!deleteBrand.deletedCount){
    return next(new AppError("brand image failed to delete" , 404))
  }


// delete from cloudinary

await cloudinary.api.delete_resources_by_prefix( `Ecommerce/categories/${category.customId}`)
await cloudinary.api.delete_folder(`Ecommerce/categories/${category.customId}`)

return res.status(200).json({msg : "done"})


})