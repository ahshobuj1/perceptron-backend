import { Router } from 'express';
import auth from '../../middlewares/auth';
import validationChecker from '../../middlewares/validationChecker';
import { cartController } from './cart.controller';
import { UserRole } from '../Auth/auth.interface';
import { cartValidations } from './cart.validations';

const router = Router();

// Get my cart (for logged-in buyer)
router.get('/my-cart', auth(UserRole.buyer), cartController.getCart);

// Add or update an item in the cart
router.post(
  '/add-cart',
  auth(UserRole.buyer),
  validationChecker(cartValidations.addItem),
  cartController.addItemToCart,
);

// Update quantity of a specific item
router.patch(
  '/update-quantity/:productId',
  auth(UserRole.buyer),
  validationChecker(cartValidations.updateQuantity),
  cartController.updateItemQuantity,
);

// Remove an item from the cart
router.delete(
  '/delete-item/:productId',
  auth(UserRole.buyer),
  cartController.removeItemFromCart,
);

export const cartRoutes = router;
