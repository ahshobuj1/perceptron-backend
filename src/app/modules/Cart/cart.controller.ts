import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { cartServices } from './cart.service';

const getCart = catchAsync(async (req, res) => {
  const result = await cartServices.getCart(req.user);
  sendResponse(res, {
    message: 'Cart retrieved successfully!',
    result: result,
  });
});

const addItemToCart = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await cartServices.addItemToCart(
    req.user,
    productId,
    quantity,
  );
  sendResponse(res, {
    message: 'Item added to cart successfully!',
    result: result,
  });
});

const updateItemQuantity = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const result = await cartServices.updateItemQuantity(
    req.user,
    productId,
    quantity,
  );
  sendResponse(res, {
    message: 'Cart quantity updated successfully!',
    result: result,
  });
});

const removeItemFromCart = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await cartServices.removeItemFromCart(req.user, productId);
  sendResponse(res, {
    message: 'Item removed from cart successfully!',
    result: result,
  });
});

export const cartController = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
};
