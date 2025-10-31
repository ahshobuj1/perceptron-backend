/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';
import { TProduct, TReview } from './product.interface';
import { ProductModel } from './product.model';
import { UserModel } from '../Auth/auth.model';
import { UserRole } from '../Auth/auth.interface';
import { OrderModel } from '../Order/order.model';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Express } from 'express';

const createProduct = async (
  payload: TProduct,
  files: any,
  user: JwtPayload,
) => {
  if (!files.images || files.images.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product images are required.');
  }
  if (!files.video || files.video.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product video is required.');
  }

  const imageUploadPromises = files.images.map(
    async (file: Express.Multer.File, index: number) => {
      const public_id = `product_${payload.name.replace(/\s/g, '_')}_img_${index}`;
      const result = await uploadToCloudinary(file.buffer, public_id, 'image');
      return { public_id: result.public_id, url: result.secure_url };
    },
  );
  const uploadedImages = await Promise.all(imageUploadPromises);

  // 2. Upload Video
  const videoFile = files.video[0];
  const video_public_id = `product_${payload.name.replace(/\s/g, '_')}_vid`;
  const videoResult = await uploadToCloudinary(
    videoFile.buffer,
    video_public_id,
    'video',
  );

  const seller = await UserModel.findOne({
    email: user.email,
    role: user.role,
  });

  if (!seller) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You are not authorized to create product!',
    );
  }

  // 3. Add URLs to payload
  payload.images = uploadedImages;
  payload.seller = seller._id;
  payload.video = {
    public_id: videoResult.public_id,
    url: videoResult.secure_url,
  };

  // 4. Create product in DB
  const result = await ProductModel.create(payload);
  return result;
};
// const createProduct = async (payload: TProduct, user: JwtPayload) => {
//   // Find the seller from the UserModel using the email from JWT
//   const seller = await UserModel.findOne({
//     email: user.email,
//     role: user.role,
//   });
//   if (!seller) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Seller account not found!');
//   }

//   // Assign the seller's ObjectId to the product payload
//   payload.seller = seller._id;

//   // Convert discountEndDate from string to Date if it exists
//   if (payload.discountEndDate) {
//     payload.discountEndDate = new Date(payload.discountEndDate);
//   }

//   const result = await ProductModel.create(payload);
//   return result;
// };

const getAllProducts = async () => {
  const result = await ProductModel.find({ isDeleted: false }).populate(
    'seller',
    'name email businessName', // Only populate these seller fields
  );
  return result;
};

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

const createReview = async (
  productId: string,
  payload: TReview,
  user: JwtPayload,
) => {
  // Find the buyer
  const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
  if (!buyer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
  }

  // Find the product
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  // Check if the user has purchased this product and the order is completed
  const hasPurchased = await OrderModel.findOne({
    buyer: buyer._id,
    'items.product': productId,
    status: 'Completed',
  });

  if (!hasPurchased) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You must purchase this product to leave a review.',
    );
  }

  // Check if the user has already reviewed this product
  const alreadyReviewed = product.reviews?.find(
    (review) => review.user.toString() === buyer._id.toString(),
  );

  if (alreadyReviewed) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already reviewed this product.',
    );
  }

  // Add the review
  const reviewData = {
    ...payload,
    user: buyer._id,
  };

  product.reviews = product.reviews || []; // Ensure reviews array exists
  product.reviews.push(reviewData as TReview); // Add new review

  // Recalculate average rating
  const totalRating = product.reviews.reduce(
    (acc, item) => acc + item.rating,
    0,
  );
  product.ratings = parseFloat(
    (totalRating / product.reviews.length).toFixed(1),
  );

  await product.save();
  return product;
};

export const productServices = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createReview,
};
