/* eslint-disable @typescript-eslint/no-misused-promises */
import BoardsController from '../controllers/boards.controller';
import Router from 'express-promise-router';

const router = Router();

// GET requests
router.get('/boards', BoardsController.getAll);

router.route('/boards/:id').get(BoardsController.getById);

// POST requests
router.route('boards/create').post(BoardsController.createBoard);

// PATCH requests
router.route('/boards/:id').patch(BoardsController.editBoard);

// DELETE requests
router.route('/boards/:id').delete(BoardsController.deleteBoard);

export default router;
