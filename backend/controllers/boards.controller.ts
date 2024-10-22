import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import createBoardDTO from '../validators/boards/create-board.dto';
import UpdateBoardTitleDTO from '../validators/boards/update-board-title.dto';
import EmailSchema from '../validators/EmailSchema';

const BoardsController = {
  // [TODO - delete this endpoint for production]
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boards = await prisma.board.findMany({ include: { users: true } });

      res.status(200).json(boards);
    } catch (error) {
      next(error);
    }
  },

  // Getting board by ID is allowed only for  assigned users
  getById: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    const requestAuthorId = req.session.userId;

    if (!requestAuthorId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      // Check if user who made the request is assigned to the board
      const assignedUser = await prisma.userOnBoard.findUnique({
        where: {
          userId_boardId: {
            userId: requestAuthorId,
            boardId,
          },
        },
      });

      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          users: {
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
          tasks: {
            orderBy: {
              createdAt: 'asc',
            },
            select: {
              id: true,
              title: true,
              boardId: true,
              status: true,
              subtasks: {
                orderBy: {
                  createdAt: 'asc',
                },
                select: {
                  id: true,
                  desc: true,
                  finished: true,
                },
              },
            },
          },
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });
      if (!assignedUser) return res.status(403).json({ error: 'Access only for assigned users!' });

      res.status(200).json(board);
    } catch (error) {
      next(error);
    }
  },

  createBoard: async (req: Request, res: Response, next: NextFunction) => {
    let boardData;

    try {
      boardData = createBoardDTO.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid board data!' });
    }

    const requestAuthorId = req.session.userId;

    if (!requestAuthorId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      // If either creating the board or assigning the author fails - the creation of both should throw an error
      const result = await prisma.$transaction(async (prisma) => {
        // Create the board
        const board = await prisma.board.create({
          data: {
            title: boardData.title,
            authorId: requestAuthorId,
          },
        });

        // Add author to userOnBoard (assignedUsers)
        await prisma.userOnBoard.create({
          data: {
            userId: requestAuthorId,
            boardId: board.id,
          },
        });

        return board;
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  // Editing board title available only for the board's author
  editBoardTitle: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    let title;
    const requestAuthorId = req.session.userId;

    if (!requestAuthorId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      const bodyObj = UpdateBoardTitleDTO.parse(req.body);
      title = bodyObj.title;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data!' });
    }

    try {
      const board = await prisma.board.findUnique({
        where: {
          id: boardId,
        },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });

      if (board.authorId !== requestAuthorId)
        return res.status(403).json({ error: 'Editing the board is only allowed by the author!' });

      await prisma.board.update({
        where: {
          id: boardId,
        },
        data: {
          title,
        },
      });

      res.status(200).json({ message: 'Board updated!' });
    } catch (error) {
      next(error);
    }
  },

  // Adding users to the board allowed only for the author of the board
  addUserToBoard: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    const requestAuthorId = req.session.userId;
    let email;
    let userToAdd;

    if (!requestAuthorId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      ({ email } = EmailSchema.parse(req.body));
    } catch (error) {
      return res.status(400).json({ error: 'Invalid email data.' });
    }

    try {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });
      if (board.authorId !== requestAuthorId)
        return res
          .status(403)
          .json({ error: 'Adding users only allowed by the creator of the board.' });

      userToAdd = await prisma.user.findUnique({
        where: { email },
      });
      if (!userToAdd) return res.status(404).json({ error: 'User not found...' });
    } catch (error) {
      return next(error);
    }

    try {
      const existingUserOnBoard = await prisma.userOnBoard.findUnique({
        where: {
          userId_boardId: {
            userId: userToAdd.id,
            boardId,
          },
        },
      });

      if (existingUserOnBoard) {
        return res.status(409).json({ error: 'User is already added to the board.' });
      }

      await prisma.userOnBoard.create({
        data: {
          userId: userToAdd.id,
          boardId,
        },
      });

      res.status(201).json(userToAdd);
    } catch (error) {
      next(error);
    }
  },

  deleteBoard: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    const requestAuthorId = req.session.userId;

    if (!requestAuthorId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      const board = await prisma.board.findUnique({
        where: {
          id: boardId,
        },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });
      if (board.authorId !== requestAuthorId)
        return res
          .status(403)
          .json({ error: "Deleting the board is only allowed by it's author." });

      await prisma.board.delete({
        where: {
          id: boardId,
        },
      });

      res.status(200).json({ message: 'Board successfully removed!' });
    } catch (error) {
      next(error);
    }
  },

  deleteUserFromBoard: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId, userId } = req.params;
    const requestAuthorId = req.session.userId;

    if (!requestAuthorId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      // Check if the board exists and user authorization
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });
      if (board.authorId !== requestAuthorId)
        return res
          .status(403)
          .json({ error: "Removing users from the board is only allowed by it's author." });

      if (board.authorId === userId)
        return res.status(403).json({ error: "Board's author cannot be removed." });

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) return res.status(404).json({ error: 'User not found...' });

      // Check if the user is on the board
      const existingUserOnBoard = await prisma.userOnBoard.findUnique({
        where: {
          userId_boardId: {
            userId,
            boardId,
          },
        },
      });
      if (!existingUserOnBoard) {
        return res.status(400).json({ error: 'User is not assigned to this board!' });
      }

      const userAssignedTasks = await prisma.task.findMany({
        where: {
          boardId: boardId,
          assignedUsers: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      let assignedTasksIds: string[] = [];

      await prisma.$transaction(async (x) => {
        // Delete UserOnTask records if there are tasks to delete
        if (userAssignedTasks.length > 0) {
          assignedTasksIds = userAssignedTasks.map((task) => task.id);
          await x.userOnTask.deleteMany({
            where: {
              userId: userId,
              taskId: { in: assignedTasksIds },
            },
          });
        }

        // Delete user from the board
        await x.userOnBoard.delete({
          where: {
            userId_boardId: {
              userId,
              boardId,
            },
          },
        });
      });
      res.status(200).json(assignedTasksIds);
    } catch (error) {
      next(error);
    }
  },
};

export default BoardsController;
