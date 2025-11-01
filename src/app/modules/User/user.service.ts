import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../Auth/auth.model';
import { AppError } from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Express } from 'express';
import { TUserRole } from '../Auth/auth.interface';

const getAllUser = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(UserModel.find(), query)
    .search(['email', 'name'])
    .filter()
    .sort()
    .pagination()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { meta, result };
};

const getMe = async (token: JwtPayload) => {
  const { email } = token;
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found, Insert correct email..!',
    );
  }

  return { user };
};

const updateUser = async (
  token: JwtPayload,
  payload: { avatar: string; name: string },
) => {
  const { email } = token;
  const updatedUser = await UserModel.findOneAndUpdate({ email }, payload, {
    new: true,
  });

  return updatedUser;
};

const changeUserStatus = async (
  id: string,
  payload: { status: string; role: string },
) => {
  const result = await UserModel.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateProfileAvatar = async (user: JwtPayload, file: any) => {
  // 1. Check if file exists
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Avatar image is required');
  }

  // 2. Upload to Cloudinary (use user's email or ID as public_id)
  const public_id = `avatar_${user.email.split('@')[0]}`;
  const result = await uploadToCloudinary(file.buffer, public_id, 'image');

  // 3. Update the user in the database
  const updatedUser = await UserModel.findOneAndUpdate(
    { email: user.email },
    { avatar: result.secure_url },
    { new: true, select: '-password' },
  );

  return updatedUser;
};

const updateUserRole = async (userId: string, newRole: TUserRole) => {
  // 1. Find the user
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // 2. Check if the new role is valid (super_admin cannot be set)
  if (newRole === 'super_admin') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot assign super_admin role.',
    );
  }

  // 3. Update the role
  user.role = newRole;
  await user.save();

  // Hide password before returning
  user.password = '';

  return user;
};

const becomeSeller = async (
  user: JwtPayload,
  payload: { businessName: string },
  file: Express.Multer.File | undefined,
) => {
  // 1. Check if file exists
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Business logo is required');
  }

  // 2. Find the user
  const userToUpdate = await UserModel.findOne({
    email: user.email,
    role: 'buyer',
  });

  if (!userToUpdate) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found or is already a seller/admin',
    );
  }

  // 3. Upload logo to Cloudinary
  const public_id = `logo_${userToUpdate._id}_${payload.businessName.replace(/\s/g, '_')}`;
  const result = await uploadToCloudinary(file.buffer, public_id, 'image');

  // 4. Update the user
  userToUpdate.role = 'seller';
  userToUpdate.businessName = payload.businessName;
  userToUpdate.businessLogo = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  await userToUpdate.save();

  // Hide password before returning
  userToUpdate.password = '';

  return userToUpdate;
};

export const userService = {
  getMe,
  changeUserStatus,
  getAllUser,
  updateUser,
  updateProfileAvatar,
  becomeSeller,
  updateUserRole,
};
