/* eslint-disable @typescript-eslint/no-misused-promises */
import BoardsController from '../controllers/boards.controller';
import Router from 'express-promise-router';
import { requiresAuth } from 'express-openid-connect';
import validateBoardIdParams from '../middleware/validateBoardIdParam';
import validateUserIdParam from '../middleware/validateUserIdParam';

const router = Router();

router.use(requiresAuth()); // add to all board routes

// GET requests

// [TODO - delete this endpoint for production]
router.get('/boards', BoardsController.getAll);

router.route('/boards/:boardId').get(validateBoardIdParams, BoardsController.getById);

// POST requests
router.route('/boards').post(BoardsController.createBoard);

router
  .route('/boards/:boardId/users/:userId')
  .post(validateBoardIdParams, validateUserIdParam, BoardsController.addUserToBoard); // post used as it is creating a relation on UserOnBoard table

// PATCH requests
router.route('/boards/:boardId').put(validateBoardIdParams, BoardsController.editBoardTitle);

// DELETE requests
router.route('/boards/:boardId').delete(validateBoardIdParams, BoardsController.deleteBoard);

router
  .route('/boards/:boardId/users/:userId')
  .delete(validateBoardIdParams, validateUserIdParam, BoardsController.deleteUserFromBoard); // delete used as it is deleting a relation on UserOnBoard table

export type boardsRoutes = typeof router;
export { router as boardsRoutes };
