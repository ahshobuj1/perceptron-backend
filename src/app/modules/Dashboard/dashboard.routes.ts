import { Router } from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../Auth/auth.interface';
import { dashboardController } from './dashboard.controller';

const router = Router();

// Admin: Get analytics for the entire platform
router.get(
  '/admin',
  auth(UserRole.admin, UserRole.super_admin),
  dashboardController.getAdminDashboardStats,
);

// Seller: Get analytics for the seller's own products
router.get(
  '/seller',
  auth(UserRole.seller),
  dashboardController.getSellerDashboardStats,
);

export const dashboardRoutes = router;
