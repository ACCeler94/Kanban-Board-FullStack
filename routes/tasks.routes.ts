/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import TasksController from '../controllers/tasks.controller';
import validateParams from '../validators/validateParams';

const router = Router();

// GET requests
// [TODO - delete this endpoint for production]
router.route('/tasks').get(TasksController.getAll);

router.route('/tasks/:taskId').get(validateParams, TasksController.getById);

// POST requests
router.route('/tasks').post(TasksController.createTask);

router.route('/tasks/:taskId/users/:userId').post(validateParams, TasksController.addUserToTask);

// PATCH requests
router.route('/tasks/:taskId').patch(validateParams, TasksController.editTask);

// DELETE requests
router.route('/tasks/:taskId').delete(validateParams, TasksController.deleteTask);

router
  .route('/tasks/:taskId/users/:userId')
  .delete(validateParams, TasksController.deleteUserFromTask);

export default router;
