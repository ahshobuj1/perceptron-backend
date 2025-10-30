import { Types } from 'mongoose';
import { TProduct } from '../Product/product.interface';

export type TCartItem = {
  product: Types.ObjectId | TProduct;
  quantity: number;
};

// Main interface for the Cart
export type TCart = {
  user: Types.ObjectId; // Buyer's user ID
  items: TCartItem[];
  totalPrice?: number;
};
