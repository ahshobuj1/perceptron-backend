import { Router } from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../Auth/auth.interface';
import { paymentValidations } from './payment.validations';
import validationChecker from '../../middlewares/validationChecker';
import { paymentController } from './payment.controller';

const router = Router();

// Buyer: Initiate online payment
router.post(
  '/initiate',
  auth(UserRole.buyer),
  validationChecker(paymentValidations.initiatePayment),
  paymentController.initiatePayment,
);

// SSLCommerz Webhooks
router.post('/success', paymentController.handleSuccessWebhook);
router.post('/fail', paymentController.handleFailWebhook);
router.post('/cancel', paymentController.handleCancelWebhook);

export const paymentRoutes = router;
