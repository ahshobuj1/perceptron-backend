import { model, Schema } from 'mongoose';
import { TPayment } from './payment.interface';
import { cartItemSchema } from '../Cart/cart.model';

const paymentSchema = new Schema<TPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentGatewayId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    deliveryLocation: {
      type: String,
      enum: ['inside_dhaka', 'outside_dhaka'],
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    items: {
      type: [cartItemSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PaymentModel = model<TPayment>('Payment', paymentSchema);
