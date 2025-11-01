import { Types } from 'mongoose';
import { TImage } from '../Product/product.interface';

export type TUser = {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  businessName?: string;
  businessLogo?: TImage;
  phone: string;
  address: string;
  status: 'in-progress' | 'blocked';
  role: 'admin' | 'super_admin' | 'seller' | 'buyer';
  isDeleted: boolean;
};

export type TActivateUser = {
  activate_code: string;
  activate_token: string;
};

export type TLogin = {
  email: string;
  password: string;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export type TResetPassword = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

export const UserRole = {
  super_admin: 'super_admin',
  admin: 'admin',
  seller: 'seller',
  buyer: 'buyer',
} as const;

export type TUserRole = keyof typeof UserRole;
