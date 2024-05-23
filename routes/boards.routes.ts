/* eslint-disable @typescript-eslint/no-misused-promises */
import BoardsController from '../controllers/boards.controller';
import Router from 'express-promise-router';
import validateParams from '../validators/validateParams';

const router = Router();

// GET requests

// [TODO - delete this endpoint for production]
router.get('/boards', BoardsController.getAll);

router.route('/boards/:boardId').get(validateParams, BoardsController.getById);

// POST requests
router.route('/boards').post(BoardsController.createBoard);

router
  .route('/boards/:boardId/users/:userId')
  .post(validateParams, BoardsController.addUserToBoard); // post used as it is creating a relation on UserOnBoard table

// PATCH requests
router.route('/boards/:boardId').put(validateParams, BoardsController.editBoardTitle);

// DELETE requests
router.route('/boards/:boardId').delete(validateParams, BoardsController.deleteBoard);

router
  .route('/boards/:boardId/users/:userId')
  .delete(validateParams, BoardsController.deleteUserFromBoard); // delete used as it is deleting a relation on UserOnBoard table

export type boardsRoutes = typeof router;
export { router as boardsRoutes };
