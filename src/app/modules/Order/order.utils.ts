import { Types } from 'mongoose';
import { CartModel } from '../Cart/cart.model';
import { ProductModel } from '../Product/product.model';
import { TCartItem } from '../Cart/cart.interface';

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
