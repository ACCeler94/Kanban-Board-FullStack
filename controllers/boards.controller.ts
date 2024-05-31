import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import createBoardDTO from '../validators/boards/create-board.dto';
import UpdateBoardTitleDTO from '../validators/boards/update-board-title';
import UserIdSchema from '../validators/UserIdSchema';

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

  // getting board by ID is allowed only for  assigned users
  getById: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    let requestAuthor;
    try {
      requestAuthor = UserIdSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    try {
      // check if user who made the request is assigned to the board
      const assignedUser = await prisma.userOnBoard.findUnique({
        where: {
          userId_boardId: {
            userId: requestAuthor.userId,
            boardId,
          },
        },
      });

      if (!assignedUser) return res.status(403).json({ error: 'Access only for assigned users!' });

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
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          tasks: true,
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });

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
      return res.status(400).json({ error: 'Invalid data' });
    }

    try {
      // if either creating the board or assigning the author fails - the creation of both should throw an error
      const result = await prisma.$transaction(async (prisma) => {
        // Create the board
        const board = await prisma.board.create({ data: boardData });

        // Add author to userOnBoard (assignedUsers)
        await prisma.userOnBoard.create({
          data: {
            userId: boardData.authorId,
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

  // editing board title available only for the board's author
  editBoardTitle: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;

    let title;
    let requestAuthor;

    try {
      const bodyObj = UpdateBoardTitleDTO.parse(req.body);
      title = bodyObj.title;
      requestAuthor = bodyObj.userId;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    try {
      const board = await prisma.board.findUnique({
        where: {
          id: boardId,
        },
      });

      if (!board) return res.status(404).json({ error: 'Board not found...' });
      if (board.authorId !== requestAuthor)
        return res.status(403).json({ error: 'Editing the board is only allowed by the author' });

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

  // adding users to the board allowed only for the author of the board
  addUserToBoard: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId, userId } = req.params;

    let requestAuthor;
    try {
      requestAuthor = UserIdSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    try {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
      });
      if (!board) return res.status(404).json({ error: 'Board not found...' });
      if (board.authorId !== requestAuthor.userId)
        return res
          .status(403)
          .json({ error: 'Adding users only allowed by the creator of the board.' });

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) return res.status(404).json({ error: 'User not found...' });
    } catch (error) {
      return next(error);
    }

    try {
      const existingUserOnBoard = await prisma.userOnBoard.findUnique({
        where: {
          userId_boardId: {
            userId,
            boardId,
          },
        },
      });

      if (existingUserOnBoard) {
        return res.status(409).json({ error: 'User is already added to the board' });
      }

      await prisma.userOnBoard.create({
        data: {
          userId,
          boardId,
        },
      });

      res.status(201).json({ message: 'User assigned to the board!' });
    } catch (error) {
      next(error);
    }
  },

  // [TODO - add authorization to allow deleting a board only by the author of the board]
  deleteBoard: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    let requestAuthor;

    try {
      requestAuthor = UserIdSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    try {
      const board = await prisma.board.findUnique({
        where: {
          id: boardId,
        },
      });
      if (!board) return res.status(404).json({ error: 'Board not found...' });
      if (board.authorId !== requestAuthor.userId)
        return res
          .status(403)
          .json({ error: "Deleting the board is only allowed by it's author." });

      await prisma.board.delete({
        where: {
          id: boardId,
        },
      });

      res.status(200).json({ message: 'Board successfully removed' });
    } catch (error) {
      next(error);
    }
  },

  // [TODO - add authorization to allow deleting a board only by the author of the board]
  deleteUserFromBoard: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId, userId } = req.params;
    let requestAuthor;

    try {
      requestAuthor = UserIdSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    try {
      // Check if the board exists and user authorization
      const board = await prisma.board.findUnique({
        where: { id: boardId },
      });
      if (!board) return res.status(404).json({ error: 'Board not found...' });
      if (board.authorId !== requestAuthor.userId)
        return res
          .status(403)
          .json({ error: "Removing users from the board is only allowed by it's author." });

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

      // Delete the user from the board
      await prisma.userOnBoard.delete({
        where: {
          userId_boardId: {
            userId,
            boardId,
          },
        },
      });

      res.status(200).json({ message: 'User removed from the board!' });
    } catch (error) {
      next(error);
    }
  },
};

export default BoardsController;
