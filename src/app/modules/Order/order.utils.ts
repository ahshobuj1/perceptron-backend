import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { CartModel } from '../Cart/cart.model';
import { ProductModel } from '../Product/product.model';
import { TCartItem } from '../Cart/cart.interface';
import { TOrderedItem } from './order.interface';
import { TProduct } from '../Product/product.interface';
import { AppError } from '../../errors/AppError';

export const DELIVERY_FEES = {
  inside_dhaka: 60,
  outside_dhaka: 130,
};

// --- Helper function for stock --
export const updateStock = async (items: TCartItem[]) => {
  for (const item of items) {
    await ProductModel.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }
};

export const clearCart = async (userId: Types.ObjectId) => {
  await CartModel.findOneAndUpdate(
    { user: userId },
    {
      $set: { items: [], totalPrice: 0 },
    },
  );
};

export const getProductPrice = async (
  productId: Types.ObjectId,
): Promise<number> => {
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Product data not found during order creation',
    );
  }
  // Use discount price if available and valid
  if (
    product.discountPrice &&
    (!product.discountEndDate || product.discountEndDate > new Date())
  ) {
    return product.discountPrice;
  }
  return product.price;
};

export const createOrderedItems = async (
  items: TCartItem[],
): Promise<TOrderedItem[]> => {
  return Promise.all(
    items.map(async (item) => {
      //  Get the product ID, whether it's populated or not
      const productId = (item.product as TProduct)._id
        ? (item.product as TProduct)._id
        : (item.product as Types.ObjectId);

      if (!productId) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Product ID could not be determined during order creation.',
        );
      }

      // Get the price at the time of sale
      const price = await getProductPrice(productId);

      return {
        product: productId,
        quantity: item.quantity,
        price: price,
      };
    }),
  );
};
