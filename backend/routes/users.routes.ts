/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import UsersController from '../controllers/users.controller';
import validateUserIdParam from '../middleware/validateUserIdParam';
import verifyJwt from '../middleware/verifyJwt';

const router = Router();

router.use(verifyJwt); // Add to all user routes
// GET
// [TODO - delete this endpoint for production]
router.route('/users').get(UsersController.getAll);

router.route('/users/profile').get(UsersController.getUserData);

router.route('/users/profile/boards').get(UsersController.getUserBoards);

router.route('/users/:userId').get(validateUserIdParam, UsersController.getById);

// POST
router.route('/users/sub').post(UsersController.getBySub);

router.route('/users/findByEmail').post(UsersController.findByEmail); // requires full email to be valid for privacy - returns email and name only

router.route('/users').post(UsersController.createUser);

export type userRoutes = typeof router;
export { router as userRoutes };
