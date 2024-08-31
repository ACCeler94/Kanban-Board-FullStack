import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '../../prisma/__mocks__/prisma';
import { Board, User } from '@prisma/client';
import BoardsController from '../../controllers/boards.controller';
import { Session, SessionData } from 'express-session';

vi.mock('../../prisma/prisma.ts');

describe('BoardsController', () => {
  const userId = '83d9930a-bdbe-4d70-9bb3-540910cb7ff4';

  const mockBoard: Board = {
    id: '1',
    createdAt: new Date('2024-06-12 16:04:21.778'),
    title: 'Mock Board Title',
    authorId: userId,
  };
  const mockUser: User = {
    id: '3713d558-d107-4c4b-b651-a99676e4315e',
    name: 'John Smith',
    email: 'john@example.com',
    auth0Sub: 'auth0|123456789',
  };

  describe('getById', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: {
          boardId: '1',
        },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and the board', async () => {
      prisma.userOnBoard.findUnique.mockResolvedValue({
        userId: mockUser.id,
        boardId: mockBoard.id,
      });
      prisma.board.findUnique.mockResolvedValue(mockBoard);

      await BoardsController.getById(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.board.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
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
          tasks: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              subtasks: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBoard);
    });

    it('should return 400 status and error message if session data does not contain valid userId', async () => {
      req.session!.userId = '';

      await BoardsController.getById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user data.' });
    });

    it('should return 403 status and error message if the request author is not assigned to the board', async () => {
      prisma.userOnBoard.findUnique.mockResolvedValue(null);
      prisma.board.findUnique.mockResolvedValue(mockBoard);

      await BoardsController.getById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access only for assigned users!' });
    });

    it('should return 404 status and error message if the board was not found', async () => {
      prisma.userOnBoard.findUnique.mockResolvedValue({
        userId: mockUser.id,
        boardId: mockBoard.id,
      });
      prisma.board.findUnique.mockResolvedValue(null);

      await BoardsController.getById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Board not found...' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.board.findUnique.mockRejectedValue(error);

      await BoardsController.getById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createBoard', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        body: { title: 'example board' },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 201 status and created board', async () => {
      prisma.$transaction.mockImplementation(async (fn) => {
        const result = await fn(prisma);
        return result;
      });

      prisma.board.create.mockResolvedValue(mockBoard);
      prisma.userOnBoard.create.mockResolvedValue({
        userId: userId,
        boardId: '1',
      });

      await BoardsController.createBoard(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.board.create).toHaveBeenCalledWith({
        data: { title: 'example board', authorId: userId },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockBoard);
    });

    it('should return 400 status and error message if board data is invalid', async () => {
      req.body = {};

      await BoardsController.createBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid board data!' });
    });

    it('should call next with an error if transaction fails', async () => {
      const error = new Error('Transaction failed');
      prisma.$transaction.mockImplementation(() => {
        throw error;
      });

      await BoardsController.createBoard(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('editBoardTitle', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: { boardId: '1' },
        body: {
          title: 'new title',
        },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and success message if board has been successfully updated', async () => {
      const updatedBoard = { ...mockBoard, title: 'new title' };

      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.board.update.mockResolvedValue(updatedBoard);

      await BoardsController.editBoardTitle(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.board.update).toHaveBeenCalledWith({
        where: {
          id: req.params!.boardId,
        },
        data: {
          title: 'new title',
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Board updated!' });
    });

    it('should return 400 status and error message if request body has invalid format or is missing', async () => {
      req.body = {};

      await BoardsController.editBoardTitle(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid data!' });
    });

    it('should return 404 status and error message if board was not found', async () => {
      prisma.board.findUnique.mockResolvedValue(null);

      await BoardsController.editBoardTitle(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Board not found...' });
    });

    it('should return 403 status and error message if the request author is not the author of the board', async () => {
      req.body = { title: 'new title' };
      req.session!.userId = 'e97498f4-4485-4481-9435-af35385e46b4';
      prisma.board.findUnique.mockResolvedValue(mockBoard);

      await BoardsController.editBoardTitle(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Editing the board is only allowed by the author!',
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.board.findUnique.mockRejectedValue(error);

      await BoardsController.editBoardTitle(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addUserToBoard', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: { boardId: '1', userId: '101bb551-a405-4e38-aa86-e9d102b288ed' },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 201 status and success message if the user was added to the board', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnBoard.findUnique.mockResolvedValue(null);
      prisma.userOnBoard.create.mockResolvedValue({
        userId: '101bb551-a405-4e38-aa86-e9d102b288ed',
        boardId: '1',
      });

      await BoardsController.addUserToBoard(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.userOnBoard.create).toHaveBeenCalledWith({
        data: {
          userId: req.params!.userId,
          boardId: req.params!.boardId,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User assigned to the board!' });
    });

    it('should return 404 status and error message if board was not found', async () => {
      prisma.board.findUnique.mockResolvedValue(null);

      await BoardsController.addUserToBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Board not found...' });
    });

    it('should return 403 status and error message if request author is not the author of the board', async () => {
      req.session!.userId = 'c1bea54c-4d77-46fa-82f4-4f1028616e6b';
      prisma.board.findUnique.mockResolvedValue(mockBoard);

      await BoardsController.addUserToBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Adding users only allowed by the creator of the board.',
      });
    });

    it('should return 404 status and error message if the user to add was not found', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.user.findUnique.mockResolvedValue(null);

      await BoardsController.addUserToBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found...' });
    });

    it('should return 409 status and error message if user is already added to the board', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnBoard.findUnique.mockResolvedValue({
        userId: '101bb551-a405-4e38-aa86-e9d102b288ed',
        boardId: '1',
      });

      await BoardsController.addUserToBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'User is already added to the board.' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.board.findUnique.mockRejectedValue(error);

      await BoardsController.addUserToBoard(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteBoard', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: { boardId: '1' },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and success message if board was successfully deleted', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.board.delete.mockResolvedValue(mockBoard);

      await BoardsController.deleteBoard(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.board.delete).toHaveBeenCalledWith({
        where: {
          id: req.params!.boardId,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Board successfully removed!' });
    });

    it('should return 404 status and error message if the board was not found', async () => {
      prisma.board.findUnique.mockResolvedValue(null);

      await BoardsController.deleteBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Board not found...' });
    });

    it('should return 403 status and error message if request author is not the author of the board ', async () => {
      req.session!.userId = 'c1bea54c-4d77-46fa-82f4-4f1028616e6b';
      prisma.board.findUnique.mockResolvedValue(mockBoard);

      await BoardsController.deleteBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Deleting the board is only allowed by it's author.",
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.board.findUnique.mockRejectedValue(error);

      await BoardsController.deleteBoard(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUserFromBoard', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: { boardId: '1', userId: '101bb551-a405-4e38-aa86-e9d102b288ed' },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and success message if user was removed from the board', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnBoard.findUnique.mockResolvedValue({
        userId: req.params!.userId,
        boardId: req.params!.boardId,
      });
      prisma.userOnBoard.delete.mockResolvedValue({
        userId: req.params!.userId,
        boardId: req.params!.boardId,
      });

      await BoardsController.deleteUserFromBoard(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.userOnBoard.delete).toHaveBeenCalledWith({
        where: {
          userId_boardId: {
            userId: req.params!.userId,
            boardId: req.params!.boardId,
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User removed from the board!' });
    });

    it('should return 404 status and error status if board was not found', async () => {
      prisma.board.findUnique.mockResolvedValue(null);

      await BoardsController.deleteUserFromBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Board not found...' });
    });

    it('should return 403 status and error message if request author is not the author of the board', async () => {
      req.session!.userId = 'f593937f-7c12-467e-82ac-a0407a12ff97';
      prisma.board.findUnique.mockResolvedValue(mockBoard);

      await BoardsController.deleteUserFromBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Removing users from the board is only allowed by it's author.",
      });
    });

    it('should return 404 status and error message if user to delete from the board was not found', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.user.findUnique.mockResolvedValue(null);

      await BoardsController.deleteUserFromBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found...',
      });
    });

    it('should return 400 status and error message if the user to delete from the board was not assigned in the first place', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnBoard.findUnique.mockResolvedValue(null);

      await BoardsController.deleteUserFromBoard(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User is not assigned to this board!',
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.board.findUnique.mockRejectedValue(error);

      await BoardsController.deleteUserFromBoard(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
