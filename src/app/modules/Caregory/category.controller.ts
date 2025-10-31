import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { categoryServices } from './category.service';

const createCategory = catchAsync(async (req, res) => {
  const result = await categoryServices.createCategory(req.body, req.file);

  sendResponse(res, {
    message: 'Category created successfully!',
    result: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await categoryServices.getAllCategories();
  sendResponse(res, {
    message: 'Categories retrieved successfully!',
    result: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoryServices.updateCategory(id, req.body);
  sendResponse(res, {
    message: 'Category updated successfully!',
    result: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoryServices.deleteCategory(id);
  sendResponse(res, {
    message: 'Category deleted successfully!',
    result: result,
  });
});

export const categoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
