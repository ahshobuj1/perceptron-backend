import { userController } from './user.controller';
import { Router } from 'express';
import validationChecker from '../../middlewares/validationChecker';
import auth from '../../middlewares/auth';
import { UserRole } from '../Auth/auth.interface';
import { userValidation } from './user.validation';
import { upload } from '../../utils/fileUpload';

const router = Router();

router.get(
  '/',
  auth(UserRole.admin, UserRole.super_admin),
  userController.getAllUser,
);

router.get(
  '/me',
  auth(UserRole.admin, UserRole.super_admin, UserRole.buyer, UserRole.seller),
  userController.getMe,
);

router.patch(
  '/update-profile',
  auth(UserRole.admin, UserRole.super_admin, UserRole.buyer, UserRole.seller),
  validationChecker(userValidation.updateProfile),
  userController.updateUser,
);

router.patch(
  '/change-status/:id',
  auth(UserRole.admin, UserRole.super_admin),
  validationChecker(userValidation.changedStatus),
  userController.changeUserStatus,
);

router.patch(
  '/update-avatar',
  auth(UserRole.admin, UserRole.super_admin, UserRole.seller, UserRole.buyer),

  upload.single('avatar'),
  userController.updateProfileAvatar,
);

export const userRoutes = router;
