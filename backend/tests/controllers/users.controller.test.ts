import { Board, Task, User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UsersController from '../../controllers/users.controller';
import prisma from '../../prisma/__mocks__/prisma';

vi.mock('../../prisma/prisma.ts');

describe('UsersController', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    auth0Sub: 'auth0|123456789',
    picture: 'abc.png',
  };

  const mockUserWithBoard = {
    ...mockUser,
    boards: [
      {
        board: {
          id: '1',
          createdAt: new Date('2024-06-12 16:04:21.778'),
          title: 'abc',
        },
      },
    ],
  };
  const userId = '83d9930a-bdbe-4d70-9bb3-540910cb7ff4';

  describe('getById', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: { userId },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return the user and status 200', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        picture: mockUser.picture,
      } as User);

      await UsersController.getById(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        picture: mockUser.picture,
      });
    });

    it('should return 404 if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await UsersController.getById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found...' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.user.findUnique.mockRejectedValue(error);

      await UsersController.getById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserBoards', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return the user and status 200', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserWithBoard);

      await UsersController.getUserBoards(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          boards: {
            select: {
              board: {
                select: {
                  title: true,
                  id: true,
                  createdAt: true,
                },
              },
            },
            orderBy: {
              board: {
                createdAt: 'asc',
              },
            },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUserWithBoard);
    });

    it('should return 404 if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await UsersController.getUserBoards(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found...' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.user.findUnique.mockRejectedValue(error);

      await UsersController.getUserBoards(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserData', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return the user and status 200', async () => {
      const mockUserExtended: User & {
        assignedTasks: Task[];
        boards: Board[];
        authoredBoards: Board[];
        authoredTasks: Task[];
      } = {
        ...mockUser,
        assignedTasks: [],
        boards: [],
        authoredBoards: [],
        authoredTasks: [],
      };
      prisma.user.findUnique.mockResolvedValue(mockUserExtended);

      await UsersController.getUserData(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          assignedTasks: true,
          boards: {
            select: {
              board: {
                select: {
                  title: true,
                  id: true,
                  createdAt: true,
                  tasks: {
                    orderBy: {
                      createdAt: 'asc',
                    },
                  },
                },
              },
            },
            orderBy: {
              board: {
                createdAt: 'asc',
              },
            },
          },
          authoredBoards: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          authoredTasks: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUserExtended);
    });

    it('should return 404 status if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await UsersController.getUserData(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found...' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.user.findUnique.mockRejectedValue(error);

      await UsersController.getUserData(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createUser', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        session: {
          auth0User: {
            sub: 'auth0|66d094172fa4b2a600a5533b',
            nickname: 'test12345',
            name: 'John Doe',
            picture:
              'https://s.gravatar.com/avatar/674ffcfe49d3c0a8343e089464fc1d02?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fte.png',
            email: 'john@example.com',
            email_verified: false,
          },
          userId: '034ff530-bb54-4526-877c-4fba3a83e8fe',
        } as Session & Partial<SessionData>,
        body: {
          name: 'John Doe',
        },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 201 status and created user when email is provided in authUser', async () => {
      prisma.user.create.mockResolvedValue(mockUser);

      await UsersController.createUser(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: req.session!.auth0User!.email,
          auth0Sub: req.session!.auth0User!.sub,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 201 status and created user when email is provided in the request body object', async () => {
      req.session!.auth0User!.email = undefined;
      req.body = { name: 'John Doe', email: 'john@example.com' };
      prisma.user.create.mockResolvedValue(mockUser);

      await UsersController.createUser(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          auth0Sub: req.session!.auth0User!.sub,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 status and invalid data error if auth0 sub is not provided', async () => {
      req.session!.auth0User!.sub = '';

      await UsersController.createUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User information is incomplete. Try again. ',
      });
    });

    it('should return 400 status and invalid data error if auth0 user object is not provided', async () => {
      req.session!.auth0User = undefined;

      await UsersController.createUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User information is incomplete. Try again. ',
      });
    });

    it('should return 400 status and invalid data error if request body is invalid', async () => {
      req.body = undefined;

      await UsersController.createUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user data.' });
    });

    it('should return 400 status and error message if email has not been provided in neither auth0 user object nor the request body', async () => {
      req.session!.auth0User!.email = undefined;
      req.body = { name: 'John Doe' };

      await UsersController.createUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User information is incomplete. Try again.',
      });
    });

    it('should return 409 status and prompt to log in if the user with this email already exists', async () => {
      req.session!.auth0User!.email = 'john@example.com'; // the same as mock user
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await UsersController.createUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User with this email already exists, please log in.',
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.user.create.mockRejectedValue(error);

      await UsersController.createUser(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
