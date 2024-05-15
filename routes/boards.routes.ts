/* eslint-disable @typescript-eslint/no-unsafe-argument */
import express from 'express';
import BoardsController from '../controllers/boards.controller';

const router = express.Router();

// GET requests
router.route('/boards').get(BoardsController.getAll);

router.route('/boards/:id').get(BoardsController.getById);

// POST requests
router.route('boards/create').post(BoardsController.createBoard);

// PATCH requests
router.route('/boards/:id').patch(BoardsController.editBoard);

// DELETE requests
router.route('/boards/:id').delete(BoardsController.deleteBoard);

export default router;
