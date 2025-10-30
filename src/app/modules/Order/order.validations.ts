import { z } from 'zod';

// Zod schema for a single ordered item
const orderedItemValidationSchema = z.object({
  product: z.string({ required_error: 'Product ID is required' }),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int()
    .positive('Quantity must be a positive integer'),
});

// Zod schema for creating a new order
const create = z.object({
  items: z
    .array(orderedItemValidationSchema)
    .min(1, 'Order must contain at least one item'),
  totalPrice: z.number().positive('Total price must be a positive number'),
  paymentMethod: z.enum(['COD', 'Bkash']).optional(),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
});

// Zod schema for updating order status (by seller)
const updateStatus = z.object({
  status: z.enum(['Processing', 'Out for Delivery', 'Completed', 'Cancelled'], {
    required_error: 'A valid status is required',
  }),
});

export const orderValidations = {
  create,
  updateStatus,
};
