import { Types } from 'mongoose';

export type TOrderedItem = {
  product: Types.ObjectId;
  quantity: number;
};

export type TStatusHistory = {
  status: string;
  timestamp: Date;
};

// Main interface for the Order
export type TOrder = {
  buyer: Types.ObjectId;
  items: TOrderedItem[];
  totalPrice: number;
  status:
    | 'Pending Approval'
    | 'Processing'
    | 'Out for Delivery'
    | 'Completed'
    | 'Cancelled';
  paymentMethod: 'COD' | 'Bkash';
  shippingAddress: string;
  statusHistory: TStatusHistory[];
};
