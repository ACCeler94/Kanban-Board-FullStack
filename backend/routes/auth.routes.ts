/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import AuthController from '../controllers/auth.controller';
import verifyJwt from '../middleware/verifyJwt';
import fetchAuth0UserInfo from '../middleware/fetchAuth0UserInfo';

const router = Router();

router.route('/post-login').post(verifyJwt, fetchAuth0UserInfo, AuthController.postLogin);

router.route('/logout').get(verifyJwt, AuthController.logout);

export type userRoutes = typeof router;
export { router as authRoutes };
