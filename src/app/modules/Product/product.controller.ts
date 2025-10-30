import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { productServices } from './product.service';

const createProduct = catchAsync(async (req, res) => {
  const result = await productServices.createProduct(req.body, req.user);

  sendResponse(res, {
    message: 'Product created successfully!',
    result: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const result = await productServices.getAllProducts();

  sendResponse(res, {
    message: 'Products retrieved successfully!',
    result: result,
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productServices.getSingleProduct(id);

  sendResponse(res, {
    message: 'Product retrieved successfully!',
    result: result,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productServices.updateProduct(id, req.body, req.user);

  sendResponse(res, {
    message: 'Product updated successfully!',
    result: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productServices.deleteProduct(id, req.user);

  sendResponse(res, {
    message: 'Product deleted successfully!',
    result: result,
  });
});

const createReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productServices.createReview(id, req.body, req.user);

  sendResponse(res, {
    message: 'Review added successfully!',
    result: result,
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createReview,
};
