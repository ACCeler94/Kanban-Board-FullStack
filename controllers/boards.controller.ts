import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import createBoardDTO from '../validators/boards/create-board.dto';
import UpdateBoardTitleDTO from '../validators/boards/update-board-title';

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

  // [TODO - add authorization to allow getting board by ID only for author or assigned users]
  getById: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    const intId = parseInt(boardId);

    try {
      const board = await prisma.board.findUnique({
        where: { id: intId },
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
      const board = await prisma.board.create({ data: boardData });

      res.status(201).json(board);
    } catch (error) {
      next(error);
    }
  },

  // [TODO - add authorization to allow editing board only by the author of the board]
  editBoardTitle: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    const intId = parseInt(boardId);
    let title;

    try {
      const bodyObj = UpdateBoardTitleDTO.parse(req.body);
      title = bodyObj.title;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    try {
      const board = await prisma.board.findUnique({
        where: {
          id: intId,
        },
      });
      if (!board) return res.status(404).json({ error: 'Board not found...' });

      await prisma.board.update({
        where: {
          id: intId,
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

  // [TODO - add authorization to allow adding users to the board only by the author of the board]
  addUserToBoard: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId, userId } = req.params;
    const intId = parseInt(boardId);
    const intUserId = parseInt(userId);

    try {
      const board = await prisma.board.findUnique({
        where: { id: intId },
      });
      if (!board) return res.status(404).json({ error: 'Board not found...' });

      const user = await prisma.user.findUnique({
        where: { id: intUserId },
      });
      if (!user) return res.status(404).json({ error: 'User not found...' });
    } catch (error) {
      return next(error);
    }

    try {
      const existingUserOnBoard = await prisma.userOnBoard.findUnique({
        where: {
          userId_boardId: {
            userId: intUserId,
            boardId: intId,
          },
        },
      });

      if (existingUserOnBoard) {
        return res.status(409).json({ error: 'User is already added to the board' });
      }

      await prisma.userOnBoard.create({
        data: {
          userId: intUserId,
          boardId: intId,
        },
      });

      res.status(200).json({ message: 'User added to board!' });
    } catch (error) {
      next(error);
    }
  },

  // [TODO - add authorization to allow deleting a board only by the author of the board]
  deleteBoard: async (req: Request, res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    const intId = parseInt(boardId);

    try {
      const board = await prisma.board.findUnique({
        where: {
          id: intId,
        },
        select: {
          author: {
            select: {
              id: true, // author id needed for future authorization
            },
          },
        },
      });
      if (!board) return res.status(404).json({ error: 'Board not found...' });

      await prisma.board.delete({
        where: {
          id: intId,
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
    const intId = parseInt(boardId);
    const intUserId = parseInt(userId);

    try {
      // Check if the board exists
      const board = await prisma.board.findUnique({
        where: { id: intId },
      });
      if (!board) return res.status(404).json({ error: 'Board not found...' });

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: intUserId },
      });
      if (!user) return res.status(404).json({ error: 'User not found...' });

      // Check if the user is on the board
      const existingUserOnBoard = await prisma.userOnBoard.findUnique({
        where: {
          userId_boardId: {
            userId: intUserId,
            boardId: intId,
          },
        },
      });
      if (!existingUserOnBoard) {
        return res.status(400).json({ error: 'User is not added to this board' });
      }

      // Delete the user from the board
      await prisma.userOnBoard.delete({
        where: {
          userId_boardId: {
            userId: intUserId,
            boardId: intId,
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
