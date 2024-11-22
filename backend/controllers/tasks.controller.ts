import { NextFunction, Request, Response } from 'express';
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
      return res.status(400).json({ error: 'Invalid data.' });
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
        return res.status(403).json({ error: 'User not assigned to the board.' });

      // Find the highest current order for tasks in the same board and status - newly created tasks are always added as the last within the column/status
      const maxOrder = await prisma.task.findFirst({
        where: { boardId: taskData.boardId, status: taskData.status },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      let newOrder;
      if (maxOrder && typeof maxOrder.order === 'number') {
        newOrder = maxOrder.order + 1;
      } else {
        newOrder = 0;
      }

      // Create the task with the calculated order
      const task = await prisma.task.create({
        data: {
          ...taskData,
          authorId: requestAuthorId,
          order: newOrder,
        },
      });

      // Handle subtasks if provided
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
      // Fetch the task with subtasks
      const taskWithSubtasks = await prisma.task.findUnique({
        where: { id: task.id },
        include: { subtasks: { orderBy: { order: 'asc' } } },
      });

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
      validatedData = editTaskDTO.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data.' });
    }

    const { taskData, subtaskData, subtasksToRemove } = validatedData;

    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return res.status(404).json({ error: 'Task not found...' });

      await prisma.$transaction(async (tx) => {
        // Update the task first
        if (taskData && Object.keys(taskData).length !== 0) {
          await tx.task.update({
            where: { id: taskId },
            data: taskData,
          });
        }

        if (taskData && (taskData.order !== undefined || taskData.status !== undefined)) {
          // Either taskData.order or taskData.status present - (if present it means) changed
          if (taskData.status !== task.status) {
            // Task moved to a different column
            // Decrement order in the old column
            await tx.task.updateMany({
              where: {
                id: {
                  not: taskId,
                },
                boardId: task.boardId,
                status: task.status,
                order: { gt: task.order },
              },
              data: {
                order: { decrement: 1 },
              },
            });

            // Increment order in the new column
            await tx.task.updateMany({
              where: {
                id: {
                  not: taskId,
                },
                boardId: task.boardId,
                status: taskData.status,
                order: { gte: taskData.order },
              },
              data: {
                order: { increment: 1 },
              },
            });
          } else {
            // Task moved within the same column
            if (taskData.order && taskData.order > task.order) {
              // Moving downwards
              await tx.task.updateMany({
                where: {
                  id: {
                    not: taskId,
                  },
                  boardId: task.boardId,
                  status: taskData.status,
                  order: {
                    gt: task.order, // Old order
                    lte: taskData.order, // New order
                  },
                },
                data: {
                  order: { decrement: 1 },
                },
              });
            } else if (taskData.order && taskData.order < task.order) {
              // Moving upwards
              await tx.task.updateMany({
                where: {
                  id: {
                    not: taskId,
                  },
                  boardId: task.boardId,
                  status: taskData.status,
                  order: {
                    gte: taskData.order,
                    lt: task.order,
                  },
                },
                data: {
                  order: { increment: 1 },
                },
              });
            }
          }
        }
      });

      // Delete subtasks based on subtasksToRemove array
      // There is no point checking if every subtask exists in the db, if not found then the id will be omitted
      if (subtasksToRemove && subtasksToRemove.length !== 0) {
        await prisma.subtask.deleteMany({
          where: {
            id: {
              in: subtasksToRemove,
            },
          },
        });
      }

      // Update or create subtasks only if subtaskData exists and is not an empty array
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

        // Reorder subtasks if new subtasks were added (it accounts for past deletions as well)
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
        where: {
          id: taskId,
        },
        include: {
          subtasks: {
            orderBy: {
              order: 'asc', // Ensures subtasks are ordered correctly
            },
          },
          assignedUsers: true, // include assigned users to data structure with getById
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
      console.log(taskId);
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
