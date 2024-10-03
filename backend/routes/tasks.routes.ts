/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'express-promise-router';
import TasksController from '../controllers/tasks.controller';
import checkBoardAssignment from '../middleware/checkBoardAssignment';
import validateTaskIdParam from '../middleware/validateTaskIdParam';
import validateUserIdParam from '../middleware/validateUserIdParam';
import verifyJwt from '../middleware/verifyJwt';
import validateSubtaskIdParam from '../middleware/validateSubtaskIdParam';

const router = Router();

router.use(verifyJwt); // Add to all tasks routes

// CheckBoardAssignment used to prevent random users (not assigned to the board) from interacting with board's tasks
// GET
router
  .route('/tasks/:taskId')
  .get(validateTaskIdParam, checkBoardAssignment, TasksController.getById);

// POST
router.route('/tasks').post(TasksController.createTask);

router
  .route('/tasks/:taskId/users/:userId')
  .post(
    validateTaskIdParam,
    validateUserIdParam,
    checkBoardAssignment,
    TasksController.addUserToTask
  );

// PATCH
router
  .route('/tasks/:taskId')
  .patch(validateTaskIdParam, checkBoardAssignment, TasksController.editTask);

// DELETE
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

router
  .route('tasks/:taskId/subtasks/:subtaskId')
  .delete(
    validateTaskIdParam,
    validateSubtaskIdParam,
    checkBoardAssignment,
    TasksController.deleteSubtask
  );

export type tasksRoutes = typeof router;
export { router as tasksRoutes };
