/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import UsersController from '../controllers/users.controller';
import { requiresAuth } from 'express-openid-connect';
import validateUserIdParam from '../middleware/validateUserIdParam';

const router = Router();

router.use(requiresAuth()); // add to all user routes
// GET requests
// [TODO - delete this endpoint for production]
router.route('/users').get(UsersController.getAll);

router.route('/users/:userId').get(validateUserIdParam, UsersController.getById);

router.route('/users/sub').get(UsersController.getBySub);

router.route('/users/search').get(UsersController.findByEmail); // search query (allowing partial searching) = search?email=""

// POST requests
router.route('/users').post(UsersController.createUser);

export type userRoutes = typeof router;
export { router as userRoutes };
