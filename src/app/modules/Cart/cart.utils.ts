import { HydratedDocument, Types } from 'mongoose';
import { TCart } from './cart.interface';

export const calculateTotalPrice = async (
  cart: HydratedDocument<TCart>, // <-- Change type from TCart
) => {
  let totalPrice = 0;
  await cart.populate('items.product');

  for (const item of cart.items) {
    // This checks if 'product' is a populated object, not just an ObjectId
    if (!(item.product instanceof Types.ObjectId)) {
      const productPrice = item.product.discountPrice || item.product.price;
      totalPrice += productPrice * item.quantity;
    }
  }
  cart.totalPrice = totalPrice;
  await cart.save();
  return cart;
};
