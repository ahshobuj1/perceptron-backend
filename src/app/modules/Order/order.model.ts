import { model, Schema } from 'mongoose';
import { TOrder, TOrderedItem, TStatusHistory } from './order.interface';

// Schema for a single ordered item
const orderedItemSchema = new Schema<TOrderedItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
});

// Schema for status history
const statusHistorySchema = new Schema<TStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Main order schema
const orderSchema = new Schema<TOrder>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderedItemSchema],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Pending Approval',
        'Processing',
        'Out for Delivery',
        'Completed',
        'Cancelled/Rejected',
      ],
      default: 'Pending Approval',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Bkash'],
      default: 'COD',
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  },
);

// Middleware to add the initial status to history before saving
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

export const OrderModel = model<TOrder>('Order', orderSchema);
