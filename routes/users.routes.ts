/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import validateParams from '../validators/validateParams';
import UsersController from '../controllers/users.controller';

const router = Router();

// GET requests
// [TODO - delete this endpoint for production]
router.route('/users').get(UsersController.getAll);

router.route('/users/:userId').get(validateParams, UsersController.getById);

router.route('/users/search').get(UsersController.findByEmail);

// POST requests
router.route('/users').post(UsersController.createUser);

export type userRoutes = typeof router;
export { router as userRoutes };
