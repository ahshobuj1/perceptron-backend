import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { orderServices } from './order.service';

const createOrderCOD = catchAsync(async (req, res) => {
  const result = await orderServices.createOrderCOD(req.user, req.body);

  sendResponse(res, {
    message: 'Order placed successfully (COD)!',
    result: result,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getMyOrders(req.user);
  sendResponse(res, {
    message: 'Orders retrieved successfully!',
    result: result,
  });
});

const getSellerOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getSellerOrders(req.user);
  sendResponse(res, {
    message: "Seller's orders retrieved successfully!",
    result: result,
  });
});

const getAllOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getAllOrders();
  sendResponse(res, {
    message: 'All orders retrieved successfully!',
    result: result,
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await orderServices.updateOrderStatus(id, status, req.user);

  sendResponse(res, {
    message: 'Order status updated successfully!',
    result: result,
  });
});

export const orderController = {
  createOrderCOD,
  getMyOrders,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
};
