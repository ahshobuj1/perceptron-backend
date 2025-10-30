import { Router } from 'express';
import auth from '../../middlewares/auth';
import validationChecker from '../../middlewares/validationChecker';
import { orderController } from './order.controller';
import { UserRole } from '../Auth/auth.interface';
import { orderValidations } from './order.validations';

const router = Router();

// Buyer: Create a new order
router.post(
  '/create-order',
  auth(UserRole.buyer),
  validationChecker(orderValidations.create),
  orderController.createOrder,
);

// Buyer: Get my orders
router.get('/my-order', auth(UserRole.buyer), orderController.getMyOrders);

// Seller: Get all orders for my products
router.get(
  '/seller-order',
  auth(UserRole.seller),
  orderController.getSellerOrders,
);

// Admin: Get all orders
router.get(
  '/',
  auth(UserRole.admin, UserRole.super_admin, UserRole.seller),
  orderController.getAllOrders,
);

// Seller: Update order status
router.patch(
  '/:id/status',
  auth(UserRole.seller),
  validationChecker(orderValidations.updateStatus),
  orderController.updateOrderStatus,
);

export const orderRoutes = router;
