import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import createTaskDTO from '../validators/tasks/create-task.dto';
import { editTaskDTO } from '../validators/tasks/edit-task.dto';

// task operations can be performed by any user assigned to the board - this condition is checked by checkBoardAssignment middleware
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
          subtasks: true,
        },
      });

      if (!task) return res.status(404).json({ error: 'Task not found...' });

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  },

  // POST
  createTask: async (req: Request, res: Response, next: NextFunction) => {
    let validatedData;

    const requestAuthorId = req.session.userId;
    if (!requestAuthorId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      validatedData = createTaskDTO.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data.' });
    }

    const { taskData, subtaskData } = validatedData;

    try {
      const board = await prisma.board.findUnique({
        where: {
          id: taskData.boardId,
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });

      const isUserAssigned = await prisma.userOnBoard.findUnique({
        where: {
          userId_boardId: {
            userId: requestAuthorId,
            boardId: taskData.boardId,
          },
        },
      });
      if (!isUserAssigned)
        return res
          .status(403)
          .json({ error: 'Access forbidden! User is not assigned to the board.' });

      const task = await prisma.task.create({
        data: { ...taskData, authorId: requestAuthorId },
      });

      if (subtaskData && subtaskData.length !== 0) {
        try {
          await prisma.$transaction(async (tx) => {
            await tx.subtask.createMany({
              data: subtaskData.map((subtask) => ({
                ...subtask,
                taskId: task.id,
                finished: false,
              })),
            });
          });
        } catch (error) {
          return res.status(500).json({
            error: 'Failed to create some or all subtasks. The main task was created successfully.',
          });
        }
      }

      // Fetch the task with subtasks and send the response - if no subtasks were created it will be an empty array
      const taskWithSubtasks = await prisma.task.findUnique({
        where: { id: task.id },
        include: { subtasks: true },
      });

      res.status(201).json(taskWithSubtasks);
    } catch (error) {
      next(error);
    }
  },

  addUserToTask: async (req: Request, res: Response, next: NextFunction) => {
    const { taskId, userId } = req.params;

    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          board: {
            include: {
              users: true,
            },
          },
        },
      });
      if (!task) return res.status(404).json({ error: 'Task not found...' });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: 'User not found...' });

      // Check if the user being added is assigned to the board
      const isUserAssignedToBoard = task.board.users.some(
        (userOnBoard) => userOnBoard.userId === userId
      );
      if (!isUserAssignedToBoard) {
        return res
          .status(403)
          .json({ error: 'Access forbidden! User is not assigned to the board.' });
      }

      // Check if the user is already assigned to the task
      const existingUserOnTask = await prisma.userOnTask.findUnique({
        where: {
          userId_taskId: {
            userId,
            taskId,
          },
        },
      });

      if (existingUserOnTask) {
        return res.status(409).json({ error: 'User is already added to the task!' });
      }

      // Assign the user to the task
      await prisma.userOnTask.create({ data: { userId, taskId } });
      res.status(201).json({ message: 'User assigned to the task!' });
    } catch (error) {
      next(error);
    }
  },
  // PATCH
  editTask: async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;
    let validatedData;

    try {
      validatedData = editTaskDTO.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const { taskData, subtaskData } = validatedData;

    if (
      (!taskData || Object.keys(taskData).length === 0) &&
      (!subtaskData || subtaskData.length === 0)
    ) {
      return res.status(400).json({ error: 'Updated task data cannot be empty!' });
    }

    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return res.status(404).json({ error: 'Task not found...' });

      // update task if taskData is provided
      if (taskData && Object.keys(taskData).length !== 0) {
        await prisma.task.update({
          where: { id: taskId },
          data: {
            ...task,
            ...taskData,
          },
        });
      }

      // update/create subtasks if subtaskData is provided
      if (subtaskData && subtaskData.length !== 0) {
        for (const subtask of subtaskData) {
          if (subtask.id) {
            // Update existing subtask
            const existingSubtask = await prisma.subtask.findUnique({
              where: { id: subtask.id },
            });
            if (!existingSubtask) {
              return res.status(404).json({ error: 'Subtask not found...' });
            }
            await prisma.subtask.update({
              where: { id: existingSubtask.id },
              data: { desc: subtask.desc },
            });
          } else {
            // create new subtask
            await prisma.subtask.create({
              data: { taskId, desc: subtask.desc, finished: false },
            });
          }
        }
      }

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
      return res.status(200).json({ message: 'Task successfully removed!' });
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

  deleteSubtask: async (req: Request, res: Response, next: NextFunction) => {
    const { subtaskId } = req.params;

    try {
      const subtask = await prisma.subtask.findUnique({ where: { id: subtaskId } });
      if (!subtask) return res.status(404).json({ error: 'Subtask not found...' });

      await prisma.subtask.delete({ where: { id: subtaskId } });
      return res.status(200).json({ message: 'Subtask successfully removed!' });
    } catch (error) {
      next(error);
    }
  },
};

export default TasksController;
