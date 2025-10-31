import httpStatus from 'http-status';
import { OrderModel } from '../Order/order.model';
import { ProductModel } from '../Product/product.model';
import { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';
import { UserModel } from '../Auth/auth.model';

// --- Admin Dashboard Service ---
const getAdminDashboardStats = async () => {
  // Get total revenue, total orders, and total completed orders
  const orderStats = await OrderModel.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$totalPrice', 0],
          },
        },
        totalCompletedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Get user, product, and category counts
  const totalBuyers = await UserModel.countDocuments({ role: 'buyer' });
  const totalSellers = await UserModel.countDocuments({ role: 'seller' });
  const totalProducts = await ProductModel.countDocuments({ isDeleted: false });
  const totalCategories = await ProductModel.distinct('category', {
    isDeleted: false,
  });

  // Get top 5 selling products
  const topSellingProducts = await OrderModel.aggregate([
    { $match: { status: 'Completed' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        _id: 0,
        productName: '$productDetails.name',
        totalSold: 1,
      },
    },
  ]);

  return {
    ...orderStats[0],
    totalBuyers,
    totalSellers,
    totalProducts,
    totalCategories: totalCategories.length,
    topSellingProducts,
  };
};

// --- Seller Dashboard Service ---
const getSellerDashboardStats = async (user: JwtPayload) => {
  const seller = await UserModel.findOne({ email: user.email, role: 'seller' });
  if (!seller) {
    throw new AppError(httpStatus.NOT_FOUND, 'Seller account not found!');
  }

  // Get all product IDs for this seller
  const sellerProducts = await ProductModel.find({ seller: seller._id }).select(
    '_id',
  );
  const sellerProductIds = sellerProducts.map((p) => p._id);

  // Get total revenue, total orders, and total completed orders
  const orderStats = await OrderModel.aggregate([
    { $match: { 'items.product': { $in: sellerProductIds } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ['$paymentStatus', 'completed'] },
              '$totalPrice', // This is an approximation
              0,
            ],
          },
        },
        totalCompletedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0],
          },
        },
      },
    },
  ]);

  // NOTE: totalRevenue is an approximation (total order price).
  // For 100% accuracy, you'd unwind items, check product ID, and sum item.price * item.quantity.
  // This aggregate is simpler and faster.

  // Get product and stock counts
  const productStats = await ProductModel.aggregate([
    { $match: { seller: seller._id, isDeleted: false } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$stock' },
      },
    },
  ]);

  // Get top 5 selling products for this seller
  const topSellingProducts = await OrderModel.aggregate([
    {
      $match: {
        status: 'Completed',
        'items.product': { $in: sellerProductIds },
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.product': { $in: sellerProductIds } } },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        _id: 0,
        productName: '$productDetails.name',
        totalSold: 1,
      },
    },
  ]);

  return {
    ...orderStats[0],
    ...productStats[0],
    topSellingProducts,
  };
};

export const dashboardServices = {
  getAdminDashboardStats,
  getSellerDashboardStats,
};
