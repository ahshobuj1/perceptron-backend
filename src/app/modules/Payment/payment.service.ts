/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';
import { PaymentModel } from './payment.model';
import { Types } from 'mongoose';
import SSLCommerz from 'sslcommerz-lts';
import config from '../../config';
import { UserModel } from '../Auth/auth.model';
import { CartModel } from '../Cart/cart.model';
import { ProductModel } from '../Product/product.model';
import { clearCart, DELIVERY_FEES } from '../Order/order.utils';
import { orderServices } from '../Order/order.service';

const initiatePayment = async (
  user: JwtPayload,
  payload: {
    deliveryLocation: 'inside_dhaka' | 'outside_dhaka';
    shippingAddress: string;
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

  // Check stock before initiating payment
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

  const transactionId = new Types.ObjectId().toString();

  // Create a payment document
  await PaymentModel.create({
    user: buyer._id,
    amount: finalTotalPrice,
    transactionId: transactionId,
    status: 'pending',
    deliveryLocation: payload.deliveryLocation,
    shippingAddress: payload.shippingAddress,
    items: cart.items, // Save a snapshot of the cart
  });

  // Prepare data for SSLCommerz
  const data = {
    total_amount: finalTotalPrice,
    currency: 'BDT',
    tran_id: transactionId,
    success_url: config.ssl_success_url,
    fail_url: config.ssl_fail_url,
    cancel_url: config.ssl_cancel_url,
    ipn_url: config.ssl_ipn_url, // Optional
    shipping_method: 'Courier',
    product_name: 'E-commerce Order',
    product_category: 'Electronic',
    product_profile: 'general',
    cus_name: buyer.name,
    cus_email: buyer.email,
    cus_add1: payload.shippingAddress,
    cus_phone: buyer.phone,
    ship_name: buyer.name,
    ship_add1: payload.shippingAddress,
  };

  const sslcz = new SSLCommerz(
    config.ssl_store_id,
    config.ssl_store_password,
    config.is_live,
  );
  const apiResponse = await sslcz.init(data);

  if (!apiResponse || !apiResponse.GatewayPageURL) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to initiate payment',
    );
  }

  return { GatewayPageURL: apiResponse.GatewayPageURL };
};

// Called by SSLCommerz webhook
const handleSuccessWebhook = async (payload: any) => {
  if (!payload || !payload.tran_id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid transaction ID');
  }

  // Validate with SSLCommerz
  const sslcz = new SSLCommerz(
    config.ssl_store_id,
    config.ssl_store_password,
    config.is_live,
  );
  const validationResponse = await sslcz.validate(payload);

  if (validationResponse.status !== 'VALID') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Payment validation failed');
  }

  // Find the payment document
  const payment = await PaymentModel.findOne({
    transactionId: payload.tran_id,
  });
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment record not found');
  }

  // Check if already processed
  if (payment.status === 'completed') {
    return; // Already done
  }

  // Update payment status
  await PaymentModel.updateOne(
    { transactionId: payload.tran_id },
    { status: 'completed', paymentGatewayId: payload.val_id },
  );

  // Create the actual order
  await orderServices.createOrderFromPayment(payment);

  // Clear the user's cart
  await clearCart(payment.user);
};

const handleFailWebhook = async (payload: any) => {
  if (!payload || !payload.tran_id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid transaction ID');
  }
  await PaymentModel.findOneAndUpdate(
    { transactionId: payload.tran_id },
    { status: 'failed' },
  );
};

const handleCancelWebhook = async (payload: any) => {
  if (!payload || !payload.tran_id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid transaction ID');
  }
  await PaymentModel.findOneAndUpdate(
    { transactionId: payload.tran_id },
    { status: 'cancelled' },
  );
};

export const paymentServices = {
  initiatePayment,
  handleSuccessWebhook,
  handleFailWebhook,
  handleCancelWebhook,
};
