/* eslint-disable @typescript-eslint/no-misused-promises */
import BoardsController from '../controllers/boards.controller';
import Router from 'express-promise-router';

const router = Router();

// GET requests

// [TODO - delete this endpoint for production]
router.get('/boards', BoardsController.getAll);

router.route('/boards/:id').get(BoardsController.getById);

// POST requests
router.route('boards/create').post(BoardsController.createBoard);

router.route('/boards/:id/users').post(BoardsController.addUserToBoard); // post used as it is creating a relation on UserOnBoard table

// PATCH requests
router.route('/boards/:id').put(BoardsController.editBoardTitle);

// DELETE requests
router.route('/boards/:id').delete(BoardsController.deleteBoard);

router.route('/boards/:id/users').delete(BoardsController.deleteUserFromBoard); // delete used as it is deleting a relation on UserOnBoard table

export type boardRoutes = typeof router;
export { router as boardRoutes };
