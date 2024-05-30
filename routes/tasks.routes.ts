/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import TasksController from '../controllers/tasks.controller';
import validateParams from '../middleware/validateParams';
import { requiresAuth } from 'express-openid-connect';
import checkBoardAssignment from '../middleware/checkBoardAssignment';

const router = Router();

router.use(requiresAuth()); // add to all tasks routes

// GET requests
router.route('/tasks/:taskId').get(validateParams, checkBoardAssignment, TasksController.getById);

// POST requests
router.route('/tasks').post(TasksController.createTask);

router
  .route('/tasks/:taskId/users/:userId')
  .post(validateParams, checkBoardAssignment, TasksController.addUserToTask);

// PATCH requests
router
  .route('/tasks/:taskId')
  .patch(validateParams, checkBoardAssignment, TasksController.editTask);

// DELETE requests
router
  .route('/tasks/:taskId')
  .delete(validateParams, checkBoardAssignment, TasksController.deleteTask);

router
  .route('/tasks/:taskId/users/:userId')
  .delete(validateParams, checkBoardAssignment, TasksController.deleteUserFromTask);

export type tasksRoutes = typeof router;
export { router as tasksRoutes };
