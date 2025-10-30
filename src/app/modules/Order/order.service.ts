import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { TOrder } from './order.interface';
import { UserModel } from '../Auth/auth.model';
import { AppError } from '../../errors/AppError';
import { ProductModel } from '../Product/product.model';
import { OrderModel } from './order.model';

const createOrder = async (user: JwtPayload, payload: TOrder) => {
  // Find the buyer
  const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
  if (!buyer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
  }

  // Check product stock before creating order
  for (const item of payload.items) {
    const product = await ProductModel.findById(item.product);
    if (!product) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Product not found: ${item.product}`,
      );
    }
    if (product.stock < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Not enough stock for ${product.name}. Available: ${product.stock}`,
      );
    }
  }

  // Create the order
  const orderData = {
    ...payload,
    buyer: buyer._id,
  };
  const result = await OrderModel.create(orderData);

  // After order creation, update stock for each product (decrement)
  for (const item of payload.items) {
    await ProductModel.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  return result;
};

const getMyOrders = async (user: JwtPayload) => {
  const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
  if (!buyer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
  }

  const result = await OrderModel.find({ buyer: buyer._id }).populate(
    'items.product',
    'name price images',
  );
  return result;
};

const getSellerOrders = async (user: JwtPayload) => {
  const seller = await UserModel.findOne({ email: user.email, role: 'seller' });

  if (!seller) {
    throw new AppError(httpStatus.NOT_FOUND, 'Seller account not found!');
  }

  // Find all products owned by this seller
  const sellerProducts = await ProductModel.find({ seller: seller._id }).select(
    '_id',
  );
  const productIds = sellerProducts.map((p) => p._id);

  // Find all orders that contain at least one of these products
  const result = await OrderModel.find({ 'items.product': { $in: productIds } })
    .populate('buyer', 'name email')
    .populate('items.product', 'name price');

  return result;
};

const getAllOrders = async () => {
  const result = await OrderModel.find()
    .populate('buyer', 'name email')
    .populate('items.product', 'name price');
  return result;
};

const updateOrderStatus = async (
  orderId: string,
  status: TOrder['status'],
  user: JwtPayload,
) => {
  const seller = await UserModel.findOne({ email: user.email, role: 'seller' });
  if (!seller) {
    throw new AppError(httpStatus.NOT_FOUND, 'Seller account not found!');
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found!');
  }

  // Check if this seller has at least one product in this order
  // (More complex check needed if you want to ensure they own the specific product being updated)
  // This is a simplified check:
  const sellerProducts = await ProductModel.find({ seller: seller._id }).select(
    '_id',
  );
  const productIds = sellerProducts.map((p) => p._id);

  const isSellerProductInOrder = order.items.some((item) =>
    productIds.includes(item.product),
  );

  if (!isSellerProductInOrder) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You are not authorized to update this order.',
    );
  }

  // Update status and add to history
  const result = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: { status: status },
      $push: { statusHistory: { status: status, timestamp: new Date() } },
    },
    { new: true },
  );

  return result;
};

export const orderServices = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
};
