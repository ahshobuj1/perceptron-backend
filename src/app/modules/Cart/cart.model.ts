import { model, Schema } from 'mongoose';
import { TCart, TCartItem } from './cart.interface';

// Schema for a single cart item
const cartItemSchema = new Schema<TCartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
});

// Main schema for the Cart
const cartSchema = new Schema<TCart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const CartModel = model<TCart>('Cart', cartSchema);
