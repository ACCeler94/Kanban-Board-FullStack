import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import prisma from '../prisma/prisma';
import EmailSchema from '../validators/EmailSchema';
import { createTaskDTO } from '../validators/tasks/create-task.dto';
import { editTaskDTO } from '../validators/tasks/edit-task.dto';

// Task operations can be performed by any user assigned to the board - this condition is checked by checkBoardAssignment middleware
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
            orderBy: {
              createdAt: 'asc',
            },
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  picture: true,
                },
              },
            },
          },
          subtasks: {
            orderBy: {
              order: 'asc', // Ensures subtasks are ordered correctly
            },
          },
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
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(({ message, path }) => ({
          message,
          path,
        }));
        return res.status(400).json(formattedErrors);
      }
      return res.status(400).json({ error: 'Invalid task data.' });
    }

    const { taskData, subtaskData } = validatedData;

    try {
      // Check if the board exists
      const board = await prisma.board.findUnique({
        where: { id: taskData.boardId },
      });
      if (!board) return res.status(404).json({ error: 'Board not found...' });

      // Ensure the user is assigned to the board
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

      // Find the highest current order for tasks in the same board and status
      const maxOrder = await prisma.task.findFirst({
        where: { boardId: taskData.boardId, status: taskData.status },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const newOrder = maxOrder && typeof maxOrder.order === 'number' ? maxOrder.order + 1 : 0;

      // Create the task
      const task = await prisma.task.create({
        data: {
          ...taskData,
          authorId: requestAuthorId,
          order: newOrder,
        },
      });

      let taskWithSubtasks;
      let subtaskError = null;

      // Attempt to create subtasks
      try {
        if (subtaskData && subtaskData.length > 0) {
          await prisma.$transaction(async (tx) => {
            for (let index = 0; index < subtaskData.length; index++) {
              const subtask = subtaskData[index];
              await tx.subtask.create({
                data: {
                  ...subtask,
                  taskId: task.id,
                  order: index,
                },
              });
            }
          });
        }

        // Fetch task with subtasks
        taskWithSubtasks = await prisma.task.findUnique({
          where: { id: task.id },
          include: { subtasks: { orderBy: { order: 'asc' } } },
        });
      } catch (subtaskCreationError) {
        subtaskError =
          'Failed to create some or all subtasks. The main task was created successfully.';
        taskWithSubtasks = task; // Return the task without subtasks
        console.error('Subtask creation error:', subtaskCreationError);
      }

      if (subtaskError) {
        return res.status(500).json({
          error: subtaskError,
        });
      }

      res.status(201).json(taskWithSubtasks);
    } catch (error) {
      next(error);
    }
  },

  addUserToTask: async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;
    let email;

    try {
      ({ email } = EmailSchema.parse(req.body));
    } catch (error) {
      return res.status(400).json({ error: 'Invalid email data.' });
    }

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

      const userToAdd = await prisma.user.findUnique({
        where: { email },
      });
      if (!userToAdd) return res.status(404).json({ error: 'User not found...' });

      // Check if the user being added is assigned to the board
      const isUserAssignedToBoard = task.board.users.some(
        (userOnBoard) => userOnBoard.userId === userToAdd.id
      );
      if (!isUserAssignedToBoard) {
        return res.status(403).json({
          error: 'User is not assigned to the board. Please add the user to the board first.',
        });
      }

      // Check if the user is already assigned to the task
      const existingUserOnTask = await prisma.userOnTask.findUnique({
        where: {
          userId_taskId: {
            userId: userToAdd.id,
            taskId,
          },
        },
      });

      if (existingUserOnTask) {
        return res.status(409).json({ error: 'User is already added to this task!' });
      }

      // Assign the user to the task
      await prisma.userOnTask.create({ data: { userId: userToAdd.id, taskId } });
      res.status(201).json(userToAdd);
    } catch (error) {
      next(error);
    }
  },

  // PATCH
  editTask: async (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;
    let validatedData;

    try {
      validatedData = editTaskDTO.parse(req.body); // Validate incoming data
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(({ message, path }) => ({
          message,
          path,
        }));
        return res.status(400).json(formattedErrors);
      }
      return res.status(400).json({ error: 'Invalid data.' });
    }

    const { taskData, subtaskData, subtasksToRemove } = validatedData;
    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return res.status(404).json({ error: 'Task not found...' });

      await prisma.$transaction(async (tx) => {
        if (taskData && Object.keys(taskData).length > 0) {
          await tx.task.update({
            where: { id: taskId },
            data: taskData, // Update properties like 'desc', 'title', etc.
          });
        }

        if (taskData && taskData.order !== undefined) {
          const currentColumnTasks = await tx.task.findMany({
            where: { boardId: task.boardId, status: task.status },
            orderBy: { order: 'asc' },
          });
          const targetColumnTasks = taskData.status
            ? await tx.task.findMany({
                where: { boardId: task.boardId, status: taskData.status },
                orderBy: { order: 'asc' },
              })
            : null;

          // Insert the task into the correct position in the target column (if moving)
          if (taskData.status && targetColumnTasks && taskData.status !== task.status) {
            // Recalculate orders for target column (moved task is already included)
            for (let i = 0; i < targetColumnTasks.length; i++) {
              await tx.task.update({
                where: { id: targetColumnTasks[i].id },
                data: { order: i },
              });
            }

            // Recalculate orders for the current column (if task was moved)
            for (let i = 0; i < currentColumnTasks.length; i++) {
              await tx.task.update({
                where: { id: currentColumnTasks[i].id },
                data: { order: i }, // Recalculate order based on index
              });
            }
          }
          // If the task remains in the same column, handle its order update
          if (!taskData.status || taskData.status === task.status) {
            const arrayWithoutMovedTask = currentColumnTasks.filter((task) => task.id !== taskId);
            const orderedTasks = [
              ...arrayWithoutMovedTask.slice(0, taskData.order),
              task,
              ...arrayWithoutMovedTask.slice(taskData.order),
            ];
            // Recalculate orders
            for (let i = 0; i < orderedTasks.length; i++) {
              await tx.task.update({
                where: { id: orderedTasks[i].id },
                data: { order: i }, // Recalculate order based on index
              });
            }
          }
        }
      });

      // Handle subtasks (creation, update, removal)
      if (subtasksToRemove && subtasksToRemove.length !== 0) {
        await prisma.subtask.deleteMany({
          where: {
            id: {
              in: subtasksToRemove,
            },
          },
        });
      }

      if (subtaskData && subtaskData.length !== 0) {
        const existingSubtasks = await prisma.subtask.findMany({
          where: { taskId },
          orderBy: { order: 'asc' },
        });

        for (let i = 0; i < subtaskData.length; i++) {
          const subtask = subtaskData[i];

          const existingSubtask = existingSubtasks.find((s) => s.id === subtask.id);

          if (existingSubtask) {
            await prisma.subtask.update({
              where: { id: subtask.id },
              data: { desc: subtask.desc, finished: subtask.finished },
            });
          } else {
            // Create new subtask
            if (!subtask.desc)
              return res.status(400).json({ error: 'New subtask requires description.' });
            await prisma.subtask.create({
              data: {
                id: subtask.id,
                taskId,
                desc: subtask.desc,
                finished: false,
                order: existingSubtasks.length + i, // New subtasks get appended to the end
              },
            });
          }
        }

        // Reorder subtasks if new subtasks were added
        if (subtaskData.length > existingSubtasks.length) {
          const updatedSubtasks = await prisma.subtask.findMany({
            where: { taskId },
            orderBy: { order: 'asc' },
          });

          for (let i = 0; i < updatedSubtasks.length; i++) {
            await prisma.subtask.update({
              where: { id: updatedSubtasks[i].id },
              data: { order: i }, // Reorder subtasks to ensure correct order
            });
          }
        }
      }

      const updatedTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          subtasks: {
            orderBy: { order: 'asc' }, // Ensures subtasks are ordered correctly
          },
          assignedUsers: true,
        },
      });

      res.status(200).json(updatedTask);
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
};

export default TasksController;
