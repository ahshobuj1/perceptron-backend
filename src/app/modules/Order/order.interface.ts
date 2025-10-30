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
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  deliveryLocation: 'inside_dhaka' | 'outside_dhaka';
  shippingAddress: string;
  status:
    | 'Pending Approval'
    | 'Processing'
    | 'Out for Delivery'
    | 'Completed'
    | 'Cancelled';
  paymentMethod: 'COD' | 'SSLCommerz';
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  statusHistory: TStatusHistory[];
};

export type TCreateCOD = {
  deliveryLocation: 'inside_dhaka' | 'outside_dhaka';
  shippingAddress: string;
};
