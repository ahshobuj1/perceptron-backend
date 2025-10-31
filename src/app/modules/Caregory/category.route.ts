import { Router } from 'express';
import auth from '../../middlewares/auth';
import validationChecker from '../../middlewares/validationChecker';
import { categoryController } from './category.controller';
import { categoryValidations } from './category.validation';
import { UserRole } from '../Auth/auth.interface';
import { formDataToJSON } from '../../utils/formDataToJSON';
import { upload } from '../../utils/fileUpload';

const router = Router();

router.get('/', categoryController.getAllCategories);

router.post(
  '/create-category',
  auth(UserRole.admin, UserRole.super_admin, UserRole.seller),

  upload.single('image'),
  formDataToJSON,

  validationChecker(categoryValidations.create),
  categoryController.createCategory,
);

router.patch(
  '/update-category/:id',
  auth(UserRole.admin, UserRole.super_admin, UserRole.seller),
  validationChecker(categoryValidations.update),
  categoryController.updateCategory,
);

router.delete(
  '/delete-category/:id',
  auth(UserRole.admin, UserRole.super_admin, UserRole.seller),
  categoryController.deleteCategory,
);

export const categoryRoutes = router;
