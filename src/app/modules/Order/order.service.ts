import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { TOrder } from './order.interface';
import { UserModel } from '../Auth/auth.model';
import { AppError } from '../../errors/AppError';
import { ProductModel } from '../Product/product.model';
import { OrderModel } from './order.model';
import { CartModel } from '../Cart/cart.model';
import { TCartItem } from '../Cart/cart.interface';
import {
  clearCart,
  createOrderedItems,
  DELIVERY_FEES,
  updateStock,
} from './order.utils';
import { TPayment } from '../Payment/payment.interface';

// For Cash on delivery order
const createOrderCOD = async (
  user: JwtPayload,
  payload: {
    shippingAddress: string;
    deliveryLocation: 'inside_dhaka' | 'outside_dhaka';
  },
) => {
  const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
  if (!buyer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
  }

  const cart = await CartModel.findOne({ user: buyer._id });
  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cart is empty!');
  }

  // Check stock
  for (const item of cart.items) {
    const product = await ProductModel.findById(item.product);
    if (!product || product.stock < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Not enough stock for ${product?.name}. Available: ${product?.stock}`,
      );
    }
  }

  const subtotal = cart.totalPrice || 0;
  const deliveryFee = DELIVERY_FEES[payload.deliveryLocation];
  const finalTotalPrice = subtotal + deliveryFee;

  const orderedItems = await createOrderedItems(cart.items as TCartItem[]);

  // Create the Order
  const orderPayload: Partial<TOrder> = {
    buyer: buyer._id,
    items: orderedItems, // <-- Use the new array with prices
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    totalPrice: finalTotalPrice,
    shippingAddress: payload.shippingAddress,
    deliveryLocation: payload.deliveryLocation,
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    status: 'Pending Approval',
  };

  const newOrder = await OrderModel.create(orderPayload);

  // Update Stock
  await updateStock(cart.items as TCartItem[]);

  // Clear Cart
  await clearCart(buyer._id);

  return newOrder;
};

// 2. For SSLCommerz payment service
const createOrderFromPayment = async (payment: TPayment) => {
  const orderedItems = await createOrderedItems(payment.items as TCartItem[]);

  const orderPayload: Partial<TOrder> = {
    buyer: payment.user,
    items: orderedItems, // <-- Use the new array with prices
    subtotal: payment.amount - DELIVERY_FEES[payment.deliveryLocation],
    deliveryFee: DELIVERY_FEES[payment.deliveryLocation],
    totalPrice: payment.amount,
    shippingAddress: payment.shippingAddress,
    deliveryLocation: payment.deliveryLocation,
    paymentMethod: 'SSLCommerz',
    paymentStatus: 'completed',
    status: 'Pending Approval',
    transactionId: payment.transactionId,
  };

  const newOrder = await OrderModel.create(orderPayload);

  // Update Stock (Cart items already saved in payment doc)
  await updateStock(payment.items);

  // Cart will be cleared by payment.service after this function returns

  return newOrder;
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
  createOrderCOD,
  createOrderFromPayment,
  getMyOrders,
  getSellerOrders,
  getAllOrders,
  updateOrderStatus,
};

// const createOrder = async (user: JwtPayload, payload: TOrder) => {
//   // Find the buyer
//   const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
//   if (!buyer) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
//   }

//   // Check product stock before creating order
//   for (const item of payload.items) {
//     const product = await ProductModel.findById(item.product);
//     if (!product) {
//       throw new AppError(
//         httpStatus.NOT_FOUND,
//         `Product not found: ${item.product}`,
//       );
//     }
//     if (product.stock < item.quantity) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         `Not enough stock for ${product.name}. Available: ${product.stock}`,
//       );
//     }
//   }

//   // Create the order
//   const orderData = {
//     ...payload,
//     buyer: buyer._id,
//   };
//   const result = await OrderModel.create(orderData);

//   // After order creation, update stock for each product (decrement)
//   for (const item of payload.items) {
//     await ProductModel.findByIdAndUpdate(item.product, {
//       $inc: { stock: -item.quantity },
//     });
//   }

//   //  Clear cart data after order and payment successful
//   await CartModel.findOneAndUpdate(
//     { user: buyer._id },
//     {
//       $set: { items: [], totalPrice: 0 },
//     },
//   );

//   return result;
// };
