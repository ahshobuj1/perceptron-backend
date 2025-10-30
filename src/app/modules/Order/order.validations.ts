import { z } from 'zod';

const createOrder = z.object({
  deliveryLocation: z.enum(['inside_dhaka', 'outside_dhaka'], {
    required_error: 'Delivery location is required',
  }),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
});

// const orderedItemValidationSchema = z.object({
//   product: z.string({ required_error: 'Product ID is required' }),
//   quantity: z
//     .number({ required_error: 'Quantity is required' })
//     .int()
//     .positive('Quantity must be a positive integer'),
// });

// const create = z.object({
//   items: z
//     .array(orderedItemValidationSchema)
//     .min(1, 'Order must contain at least one item'),
//   totalPrice: z.number().positive('Total price must be a positive number'),
//   paymentMethod: z.enum(['COD', 'Bkash']).optional(),
//   shippingAddress: z.string().min(1, 'Shipping address is required'),
// });

// Zod schema for updating order status (by seller)
const updateStatus = z.object({
  status: z.enum(['Processing', 'Out for Delivery', 'Completed', 'Cancelled'], {
    required_error: 'A valid status is required',
  }),
});

export const orderValidations = {
  createOrder,
  updateStatus,
};
