import { z } from 'zod';

const initiatePayment = z.object({
  deliveryLocation: z.enum(['inside_dhaka', 'outside_dhaka'], {
    required_error: 'Delivery location is required',
  }),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
});

export const paymentValidations = {
  initiatePayment,
};
