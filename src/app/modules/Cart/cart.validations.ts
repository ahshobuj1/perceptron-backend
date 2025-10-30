import { z } from 'zod';

// Zod schema for adding/updating an item in the cart
const addItem = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int()
    .positive('Quantity must be a positive integer'),
});

// Zod schema for updating quantity
const updateQuantity = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int()
    .min(1, 'Quantity must be at least 1'),
});

export const cartValidations = {
  addItem,
  updateQuantity,
};
