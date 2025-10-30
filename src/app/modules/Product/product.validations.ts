import { z } from 'zod';

const imageValidationSchema = z.object({
  url: z.string().url(),
});

const videoValidationSchema = z.object({
  url: z.string().url(),
});

// Zod schema for creating a product
const create = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  stock: z.number().int().min(0, { message: 'Stock cannot be negative' }),
  discountPrice: z.number().positive().optional(),
  discountEndDate: z.string().optional(), // Will be converted from string to Date in service
  images: z
    .array(imageValidationSchema)
    .min(1, { message: 'At least one image is required' }),
  video: videoValidationSchema,
});

// Zod schema for updating a product (all fields are optional)
const update = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  discountPrice: z.number().positive().optional(),
  discountEndDate: z.string().optional(),
  images: z.array(imageValidationSchema).optional(),
  video: videoValidationSchema.optional(),
});

export const productValidations = {
  create,
  update,
};
