import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';
import { TProduct } from './product.interface';
import { ProductModel } from './product.model';
import { UserModel } from '../Auth/auth.model';
import { UserRole } from '../Auth/auth.interface';

// Service to create a new product
const createProduct = async (payload: TProduct, user: JwtPayload) => {
  // Find the seller from the UserModel using the email from JWT
  const seller = await UserModel.findOne({
    email: user.email,
    role: user.role,
  });
  if (!seller) {
    throw new AppError(httpStatus.NOT_FOUND, 'Seller account not found!');
  }

  // Assign the seller's ObjectId to the product payload
  payload.seller = seller._id;

  // Convert discountEndDate from string to Date if it exists
  if (payload.discountEndDate) {
    payload.discountEndDate = new Date(payload.discountEndDate);
  }

  const result = await ProductModel.create(payload);
  return result;
};

// Service to get all products
const getAllProducts = async () => {
  const result = await ProductModel.find({ isDeleted: false }).populate(
    'seller',
    'name email businessName', // Only populate these seller fields
  );
  return result;
};

// Service to get a single product
const getSingleProduct = async (id: string) => {
  const result = await ProductModel.findOne({
    _id: id,
    isDeleted: false,
  }).populate('seller', 'name email businessName');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }
  return result;
};

// Service to update a product
const updateProduct = async (
  id: string,
  payload: Partial<TProduct>,
  user: JwtPayload,
) => {
  // Find the product
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  // Find the seller
  const seller = await UserModel.findOne({
    email: user.email,
    role: user.role,
  });
  if (!seller) {
    throw new AppError(httpStatus.NOT_FOUND, 'Seller account not found!');
  }

  // Check if the seller updating the product is the one who created it
  if (product.seller.toString() !== seller._id.toString()) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You are not authorized to update this product!',
    );
  }

  // Convert discountEndDate from string to Date if it exists in payload
  if (payload.discountEndDate) {
    payload.discountEndDate = new Date(payload.discountEndDate);
  }

  const result = await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

// Service to delete a product (soft delete)
const deleteProduct = async (id: string, user: JwtPayload) => {
  // Find the product
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  // If user is a seller, check if they own the product
  if (user.role === UserRole.seller) {
    const seller = await UserModel.findOne({ email: user.email });
    if (!seller || product.seller.toString() !== seller._id.toString()) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not authorized to delete this product!',
      );
    }
  }
  // If user is admin, they can delete any product (no extra check needed)

  const result = await ProductModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result;
};

export const productServices = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
