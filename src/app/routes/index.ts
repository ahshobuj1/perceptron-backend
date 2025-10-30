import { Router } from 'express';
import { testRoutes } from '../modules/Test/test.routes';
import { authRoutes } from '../modules/Auth/auth.routes';
import { userRoutes } from '../modules/User/user.routes';
import { productRoutes } from '../modules/Product/product.routes';
import { orderRoutes } from '../modules/Order/order.routes';
import { cartRoutes } from '../modules/Cart/cart.routes';

const router = Router();

const modulesRoutes = [
  {
    path: '/test',
    route: testRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/products',
    route: productRoutes,
  },
  {
    path: '/orders',
    route: orderRoutes,
  },
  {
    path: '/carts',
    route: cartRoutes,
  },
];

modulesRoutes.forEach((data) => router.use(data.path, data.route));

export default router;
