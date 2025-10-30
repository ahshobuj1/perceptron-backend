import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';
import { CartModel } from './cart.model';
import { UserModel } from '../Auth/auth.model';
import { ProductModel } from '../Product/product.model';
import { calculateTotalPrice } from './cart.utils';

// Get the user's cart
const getCart = async (user: JwtPayload) => {
  const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
  if (!buyer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
  }

  let cart = await CartModel.findOne({ user: buyer._id }).populate({
    path: 'items.product',
    model: 'Product',
  });

  if (!cart) {
    cart = await CartModel.create({
      user: buyer._id,
      items: [],
      totalPrice: 0,
    });
  }

  // Recalculate price every time cart is fetched to ensure it's up-to-date
  cart = await calculateTotalPrice(cart);

  return cart;
};

// Add or update an item in the cart
const addItemToCart = async (
  user: JwtPayload,
  productId: string,
  quantity: number,
) => {
  const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
  if (!buyer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
  }

  const product = await ProductModel.findById(productId);
  if (!product || product.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found!');
  }

  if (product.stock < quantity) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Not enough stock!');
  }

  let cart = await CartModel.findOne({ user: buyer._id });

  if (!cart) {
    cart = await CartModel.create({ user: buyer._id, items: [] });
  }

  // Check if item already exists in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex > -1) {
    // Item exists, update quantity
    cart.items[itemIndex].quantity = quantity;
  } else {
    // Item does not exist, add new item
    cart.items.push({ product: product._id, quantity: quantity });
  }

  // Recalculate total price
  cart = await calculateTotalPrice(cart);

  return cart;
};

// Update item quantity
const updateItemQuantity = async (
  user: JwtPayload,
  productId: string,
  quantity: number,
) => {
  const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
  if (!buyer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
  }

  let cart = await CartModel.findOne({ user: buyer._id });
  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found!');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found in cart!');
  }

  cart.items[itemIndex].quantity = quantity;
  cart = await calculateTotalPrice(cart);

  return cart;
};

// Remove an item from the cart
const removeItemFromCart = async (user: JwtPayload, productId: string) => {
  const buyer = await UserModel.findOne({ email: user.email, role: 'buyer' });
  if (!buyer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Buyer account not found!');
  }

  let cart = await CartModel.findOne({ user: buyer._id });
  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found!');
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  cart = await calculateTotalPrice(cart);

  return cart;
};

export const cartServices = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
};
