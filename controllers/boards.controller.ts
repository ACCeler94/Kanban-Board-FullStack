import prisma from '../prisma/prisma';
import { Request, Response, NextFunction } from 'express';
import createBoardDTO from '../validators/boards/create-board.dto';
import UpdateBoardTitleDTO from '../validators/boards/update-board-title';
import addUserToBoardDTO from '../validators/boards/add-user-to-board.dto';
import removeUserFromBoardDTO from '../validators/boards/remove-user-from-board.dto';

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
    const { id } = req.params;
    const intId = parseInt(id);

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
    const { id } = req.params;
    const intId = parseInt(id);
    let title;

    try {
      const bodyObj = UpdateBoardTitleDTO.parse(req.body);
      title = bodyObj.title;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const board = await prisma.board.findUnique({
      where: {
        id: intId,
      },
    });
    if (!board) return res.status(404).json({ error: 'Board not found...' });

    try {
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
    const { id } = req.params;
    const intId = parseInt(id);
    let userIdToAdd;

    try {
      const bodyObj = addUserToBoardDTO.parse(req.body);
      userIdToAdd = bodyObj.userId;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const board = await prisma.board.findUnique({
      where: {
        id: intId,
      },
    });
    if (!board) return res.status(404).json({ error: 'Board not found...' });

    const user = await prisma.user.findUnique({
      where: {
        id: userIdToAdd,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found...' });

    // Check for an existing UserOnBoard record
    const existingUserOnBoard = await prisma.userOnBoard.findUnique({
      where: {
        userId_boardId: {
          userId: userIdToAdd,
          boardId: intId,
        },
      },
    });

    if (existingUserOnBoard) {
      return res.status(409).json({ error: 'User is already added to the board' });
    }

    try {
      await prisma.userOnBoard.create({
        data: {
          userId: userIdToAdd,
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
    const { id } = req.params;
    const intId = parseInt(id);

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

    try {
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
    const { id } = req.params;
    const intId = parseInt(id);
    let userIdToRemove;

    try {
      const bodyObj = removeUserFromBoardDTO.parse(req.body);
      userIdToRemove = bodyObj.userId;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const board = await prisma.board.findUnique({
      where: {
        id: intId,
      },
    });
    if (!board) return res.status(404).json({ error: 'Board not found...' });

    const user = await prisma.user.findUnique({
      where: {
        id: userIdToRemove,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found...' });

    // Check for an existing UserOnBoard record
    const existingUserOnBoard = await prisma.userOnBoard.findUnique({
      where: {
        userId_boardId: {
          userId: userIdToRemove,
          boardId: intId,
        },
      },
    });

    if (!existingUserOnBoard) {
      return res.status(400).json({ error: 'User is not added to this board' });
    }

    try {
      await prisma.userOnBoard.delete({
        where: {
          userId_boardId: {
            userId: userIdToRemove,
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
