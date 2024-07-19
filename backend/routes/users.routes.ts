/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import UsersController from '../controllers/users.controller';
import validateUserIdParam from '../middleware/validateUserIdParam';
import verifyJwt from '../middleware/verifyJwt';

const router = Router();

router.use(verifyJwt); // add to all user routes
// GET requests
// [TODO - delete this endpoint for production]
router.route('/users').get(UsersController.getAll);

router.route('/users/sub').get(UsersController.getBySub);

router.route('/users/search').get(UsersController.findByEmail); // search query (allowing partial searching) = search?email=""

router.route('/users/profile').get(UsersController.getUserData);

router.route('/users/:userId').get(validateUserIdParam, UsersController.getById);

// POST requests
router.route('/users').post(UsersController.createUser);

export type userRoutes = typeof router;
export { router as userRoutes };
