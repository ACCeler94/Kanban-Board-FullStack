import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import createTaskDTO from '../validators/tasks/create-task.dto';
import editTaskDTO from '../validators/tasks/edit-task.dto';

const TasksController = {
  // GET
  getById: async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;

    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedUsers: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!task) return res.status(404).json({ error: 'Task not found' });

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  // POST
  createTask: async (req: Request, res: Response, next: NextFunction) => {
    let taskData;

    try {
      taskData = createTaskDTO.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    try {
      const board = await prisma.board.findUnique({
        where: {
          id: taskData.boardId,
        },
        include: {
          users: true,
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });

      const isUserAssigned = board.users.some(
        (userOnBoard) => userOnBoard.userId === taskData.authorId
      );
      if (!isUserAssigned)
        return res
          .status(403)
          .json({ error: 'Access forbidden. User is not assigned to the board.' });

      const task = await prisma.task.create({ data: taskData });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  addUserToTask: async (req: Request, res: Response, next: NextFunction) => {
    const { taskId, userId } = req.params;

    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return res.status(404).json({ message: 'Task not found...' });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ message: 'User not found...' });
    } catch (error) {
      next(error);
    }

    try {
      const existingUserOnTask = await prisma.userOnTask.findUnique({
        where: {
          userId_taskId: {
            userId,
            taskId,
          },
        },
      });

      if (existingUserOnTask)
        return res.status(409).json({ error: 'User is already added to the task' });

      await prisma.userOnTask.create({ data: { userId, taskId } });
      res.status(201).json({ message: 'User assigned to the task!' });
    } catch (error) {
      next(error);
    }
  },
  // PATCH
  editTask: async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;
    let taskData;

    try {
      taskData = editTaskDTO.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return res.status(404).json({ error: 'Task not found...' });

      await prisma.task.update({ where: { id: taskId }, data: taskData });
      res.status(200).json({ message: 'Task updated!' });
    } catch (error) {
      next(error);
    }
  },
  // DELETE
  deleteTask: async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;

    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return res.status(404).json({ error: 'Task not found...' });

      await prisma.task.delete({ where: { id: taskId } });
      return res.status(200).json({ message: 'Task successfully removed' });
    } catch (error) {
      next(error);
    }
  },

  deleteUserFromTask: async (req: Request, res: Response, next: NextFunction) => {
    const { userId, taskId } = req.params;

    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return res.status(404).json({ error: 'Task not found...' });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: 'User not found...' });
    } catch (error) {
      next(error);
    }

    try {
      const existingUserOnTask = await prisma.userOnTask.findUnique({
        where: {
          userId_taskId: {
            userId,
            taskId,
          },
        },
      });
      if (!existingUserOnTask)
        return res.status(400).json({ error: 'User is not assigned to this task!' });

      await prisma.userOnTask.delete({
        where: {
          userId_taskId: {
            userId,
            taskId,
          },
        },
      });
      res.status(200).json({ message: 'User removed from the task!' });
    } catch (error) {
      next(error);
    }
  },
};

export default TasksController;
