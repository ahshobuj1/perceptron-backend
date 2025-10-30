import { Types } from 'mongoose';
import { TCartItem } from '../Cart/cart.interface';

export type TPayment = {
  user: Types.ObjectId;
  amount: number;
  transactionId: string;
  paymentGatewayId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  deliveryLocation: 'inside_dhaka' | 'outside_dhaka';
  shippingAddress: string;
  items: TCartItem[];
};
