/* eslint-disable @typescript-eslint/no-misused-promises */
import BoardsController from '../controllers/boards.controller';
import Router from 'express-promise-router';
import validateBoardIdParams from '../middleware/validateBoardIdParam';
import validateUserIdParam from '../middleware/validateUserIdParam';
import verifyJwt from '../middleware/verifyJwt';

const router = Router();

router.use(verifyJwt); // Add to all board routes

// GET
router.route('/boards/:boardId').get(validateBoardIdParams, BoardsController.getById);

router.route('/boards/:boardId/users').get(validateBoardIdParams, BoardsController.getBoardUsers);

// POST
router.route('/boards').post(BoardsController.createBoard);

router
  .route('/boards/:boardId/users/add')
  .post(validateBoardIdParams, BoardsController.addUserToBoard); // post used as it is creating a relation on UserOnBoard table

// PATCH
router.route('/boards/:boardId').patch(validateBoardIdParams, BoardsController.editBoardTitle);

// DELETE
router
  .route('/boards/:boardId/users/:userId')
  .delete(validateBoardIdParams, validateUserIdParam, BoardsController.deleteUserFromBoard); // delete used as it is deleting a relation on UserOnBoard table

router.route('/boards/:boardId').delete(validateBoardIdParams, BoardsController.deleteBoard);

export type boardsRoutes = typeof router;
export { router as boardsRoutes };
