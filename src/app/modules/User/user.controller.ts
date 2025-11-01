import { userService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAllUser = catchAsync(async (req, res) => {
  const result = await userService.getAllUser(req?.query);

  sendResponse(res, {
    message: 'All users retrieved successfully',
    meta: result?.meta,
    result: result?.result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const token = req.user;
  const result = await userService.getMe(token);

  sendResponse(res, {
    message: 'User is retrieved successfully',
    result: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const token = req.user;
  const result = await userService.updateUser(token, req.body);

  sendResponse(res, {
    message: 'Profile is updated successfully',
    result: result,
  });
});

const changeUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await userService.changeUserStatus(id, req.body);

  sendResponse(res, {
    message: 'Changed user status successfully!',
    result: result,
  });
});

const updateProfileAvatar = catchAsync(async (req, res) => {
  const result = await userService.updateProfileAvatar(req.user, req.file);

  sendResponse(res, {
    message: 'Avatar updated successfully!',
    result,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const result = await userService.updateUserRole(id, role);

  sendResponse(res, {
    message: 'User role updated successfully!',
    result: result,
  });
});

const becomeSeller = catchAsync(async (req, res) => {
  const result = await userService.becomeSeller(req.user, req.body, req.file);

  sendResponse(res, {
    message: 'Congratulations! You are now a seller.',
    result: result,
  });
});

export const userController = {
  getMe,
  changeUserStatus,
  getAllUser,
  updateUser,
  updateProfileAvatar,
  becomeSeller,
  updateUserRole,
};
