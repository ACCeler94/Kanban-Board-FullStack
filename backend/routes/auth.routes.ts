/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import AuthController from '../controllers/auth.controller';
import { requiresAuth } from 'express-openid-connect';

const router = Router();

router.route('/callback').get(AuthController.PostLogin);

router.route('/logout').get(requiresAuth(), AuthController.Logout);

export type userRoutes = typeof router;
export { router as authRoutes };
