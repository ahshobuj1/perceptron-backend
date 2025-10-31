import { z } from 'zod';

const create = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

const update = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const categoryValidations = {
  create,
  update,
};
