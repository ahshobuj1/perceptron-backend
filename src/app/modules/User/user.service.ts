import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../Auth/auth.model';
import { AppError } from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { uploadToCloudinary } from '../../utils/cloudinary';

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

export const userService = {
  getMe,
  changeUserStatus,
  getAllUser,
  updateUser,
  updateProfileAvatar,
};
