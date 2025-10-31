import httpStatus from 'http-status';
import { TCategory } from './category.interface';
import { CategoryModel } from './category.model';
import { AppError } from '../../errors/AppError';
import { ProductModel } from '../Product/product.model';
import { uploadToCloudinary } from '../../utils/cloudinary';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createCategory = async (payload: TCategory, file: any) => {
  //  Check if file exists
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Category image is required');
  }

  //  Upload to Cloudinary
  const public_id = `category_${payload.name.replace(/\s/g, '_')}`;
  const result = await uploadToCloudinary(file.buffer, public_id, 'image');

  //  Add image data to the payload
  payload.image = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  // Create the category in the database
  const newCategory = await CategoryModel.create(payload);
  return newCategory;
};

const getAllCategories = async () => {
  const result = await CategoryModel.find();
  return result;
};

const updateCategory = async (id: string, payload: Partial<TCategory>) => {
  const result = await CategoryModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }
  return result;
};

const deleteCategory = async (id: string) => {
  // Check if any product is using this category
  const productCount = await ProductModel.countDocuments({ category: id });
  if (productCount > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot delete category. It is already associated with products.',
    );
  }

  const result = await CategoryModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found!');
  }
  return result;
};

export const categoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
