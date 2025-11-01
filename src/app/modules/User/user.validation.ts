import { z } from 'zod';

const changedStatus = z.object({
  status: z.enum(['in-progress', 'blocked'], {
    invalid_type_error: 'Status must be in-progress | blocked ',
  }),
  role: z.enum(['user', 'admin'], {
    invalid_type_error: 'Role must be user | admin ',
  }),
});

const updateProfile = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(),
});

const updateRole = z.object({
  role: z.enum(['admin', 'seller', 'buyer'], {
    required_error: 'A valid role is required (admin, seller, or buyer)',
  }),
});

const becomeSeller = z.object({
  businessName: z.string().min(1, {
    message: 'Business name is required',
  }),
});

export const userValidation = {
  changedStatus,
  updateProfile,
  becomeSeller,
  updateRole,
};
