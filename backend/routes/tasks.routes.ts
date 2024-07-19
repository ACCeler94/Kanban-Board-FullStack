/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import TasksController from '../controllers/tasks.controller';
import checkBoardAssignment from '../middleware/checkBoardAssignment';
import validateTaskIdParam from '../middleware/validateTaskIdParam';
import validateUserIdParam from '../middleware/validateUserIdParam';
import verifyJwt from '../middleware/verifyJwt';

const router = Router();

router.use(verifyJwt); // add to all tasks routes

// checkBoardAssignment used to prevent random users (not assigned to the board) from interacting with board's tasks
// GET requests
router
  .route('/tasks/:taskId')
  .get(validateTaskIdParam, checkBoardAssignment, TasksController.getById);

// POST requests
router.route('/tasks').post(TasksController.createTask);

router
  .route('/tasks/:taskId/users/:userId')
  .post(
    validateTaskIdParam,
    validateUserIdParam,
    checkBoardAssignment,
    TasksController.addUserToTask
  );

// PATCH requests
router
  .route('/tasks/:taskId')
  .patch(validateTaskIdParam, checkBoardAssignment, TasksController.editTask);

// DELETE requests
router
  .route('/tasks/:taskId/users/:userId')
  .delete(
    validateTaskIdParam,
    validateUserIdParam,
    checkBoardAssignment,
    TasksController.deleteUserFromTask
  );

router
  .route('/tasks/:taskId')
  .delete(validateTaskIdParam, checkBoardAssignment, TasksController.deleteTask);

export type tasksRoutes = typeof router;
export { router as tasksRoutes };
