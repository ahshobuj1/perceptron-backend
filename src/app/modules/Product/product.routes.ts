import { Router } from 'express';
import validationChecker from '../../middlewares/validationChecker';
import auth from '../../middlewares/auth';
import { UserRole } from '../Auth/auth.interface';
import { productValidations } from './product.validations';
import { productController } from './product.controller';

const router = Router();

router.post(
  '/create-product',
  auth(UserRole.seller),
  validationChecker(productValidations.create),
  productController.createProduct,
);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getSingleProduct);

router.patch(
  '/update-product/:id',
  auth(UserRole.seller),
  validationChecker(productValidations.update),
  productController.updateProduct,
);

router.delete(
  '/soft-delete/:id',
  auth(UserRole.seller, UserRole.admin),
  productController.deleteProduct,
);

export const productRoutes = router;
