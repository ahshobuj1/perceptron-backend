import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { dashboardServices } from './dashboard.service';

const getAdminDashboardStats = catchAsync(async (req, res) => {
  const result = await dashboardServices.getAdminDashboardStats();

  sendResponse(res, {
    message: 'Admin dashboard analytics retrieved successfully!',
    result: result,
  });
});

const getSellerDashboardStats = catchAsync(async (req, res) => {
  const result = await dashboardServices.getSellerDashboardStats(req.user);

  sendResponse(res, {
    message: 'Seller dashboard analytics retrieved successfully!',
    result: result,
  });
});

export const dashboardController = {
  getAdminDashboardStats,
  getSellerDashboardStats,
};
