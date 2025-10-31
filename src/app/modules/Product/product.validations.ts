import z from 'zod';

const create = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  stock: z.number().int().min(0, { message: 'Stock cannot be negative' }),
  discountPrice: z.number().positive().optional(),
  discountEndDate: z.string().optional(),
});

const update = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  discountPrice: z.number().positive().optional(),
  discountEndDate: z.string().optional(),
});

const createReview = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be between 1-5')
    .max(5, 'Rating must be between 1-5'),
  comment: z.string().min(1, 'Comment is required'),
});

export const productValidations = {
  create,
  update,
  createReview,
};
