import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UsersController from '../../controllers/users.controller';
import prisma from '../../prisma/__mocks__/prisma';
import Auth0User from '../../types/Auth0User';
import { RequestContext } from 'express-openid-connect';
import { Board, Task, User } from '@prisma/client';
import { Session, SessionData } from 'express-session';

vi.mock('../../prisma/prisma.ts');

describe('UsersController', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    auth0Sub: 'auth0|123456789',
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
      } as User);

      await UsersController.getById(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
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

  describe('getByIdExtended', () => {
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

      await UsersController.getByIdExtended(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          assignedTasks: true,
          boards: true,
          authoredBoards: true,
          authoredTasks: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUserExtended);
    });

    it('should return 404 status if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await UsersController.getByIdExtended(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found...' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.user.findUnique.mockRejectedValue(error);

      await UsersController.getByIdExtended(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return a 403 status if the requested user does not match the author of the request', async () => {
      const notMatchingId = '4f9dbb99-5d24-4787-8f26-f05f99e46e47';
      req.params!.userId = notMatchingId;

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
      prisma.user.findUnique.mockResolvedValue({ ...mockUserExtended, id: notMatchingId });

      await UsersController.getByIdExtended(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access Forbidden!' });
    });
  });

  describe('getBySub', () => {
    let req: Partial<Request & { oidc?: RequestContext & { user?: Auth0User } }>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        oidc: {
          user: {
            sub: 'auth0|123456789',
          },
          isAuthenticated: () => true,
          fetchUserInfo: async () => {},
        } as unknown as RequestContext & { user: Auth0User },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return the user and 200 status', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await UsersController.getBySub(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { auth0Sub: req.oidc!.user!.sub },
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 status and the error message if the user object is not in the request', async () => {
      req.oidc!.user = undefined;

      await UsersController.getBySub(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User information is missing or incomplete. Try again. ',
      });
    });

    it('should return 404 status and the error message if the user was not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await UsersController.getBySub(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found...',
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.user.findUnique.mockRejectedValue(error);

      await UsersController.getBySub(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('findByEmail', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        query: { email: 'john' },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return the users array and 200 status', async () => {
      const mockUserArr: User[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          auth0Sub: 'auth0|123456789',
        },
        {
          id: '2',
          name: 'John Smith',
          email: 'johnSmith@example.com',
          auth0Sub: 'auth0|123456789',
        },
      ];
      prisma.user.findMany.mockResolvedValue(mockUserArr);

      await UsersController.findByEmail(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            email: {
              contains: req.query!.email,
            },
          },
        })
      );
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith(mockUserArr);
    });

    it('should return 404 status and not found message if no users were found', async () => {
      req.query!.email = 'abc';
      prisma.user.findMany.mockResolvedValue([]);

      await UsersController.findByEmail(req as Request, res as Response, next);

      expect(res.status).toBeCalledWith(404);
      expect(res.json).toBeCalledWith({ error: 'No users found...' });
    });

    it('should return 400 Bad Request if email query is not provided', async () => {
      req.query = {};

      await UsersController.findByEmail(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid search query.' });
    });

    it('should return 400 Bad Request if email query is not a string', async () => {
      req.query!.email = ['abc', 'cde'];

      await UsersController.findByEmail(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid search query.' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.user.findMany.mockRejectedValue(error);

      await UsersController.findByEmail(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createUser', () => {
    let req: Partial<Request & { oidc?: RequestContext & { user?: Auth0User } }>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        oidc: {
          user: {
            sub: 'auth0|123456789',
          },
          isAuthenticated: () => true,
          fetchUserInfo: async () => {},
        } as unknown as RequestContext & { user: Auth0User },
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
      req.oidc!.user!.email = 'auth0@example.com';
      prisma.user.create.mockResolvedValue(mockUser);

      await UsersController.createUser(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: req.oidc!.user!.email,
          auth0Sub: req.oidc!.user!.sub,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 201 status and created user when email is provided in the request body object', async () => {
      req.body = { name: 'John Doe', email: 'john@example.com' };
      prisma.user.create.mockResolvedValue(mockUser);

      await UsersController.createUser(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          auth0Sub: req.oidc!.user!.sub,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 status and invalid data error if auth0 sub is not provided', async () => {
      req.oidc!.user!.sub = '';

      await UsersController.createUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User information is incomplete. Try again. ',
      });
    });

    it('should return 400 status and invalid data error if auth0 user object is not provided', async () => {
      req.oidc!.user = undefined;

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
      await UsersController.createUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User information is incomplete. Try again.',
      });
    });

    it('should return 409 status and prompt to log in if the user with this email already exists', async () => {
      req.oidc!.user!.email = 'auth0@example.com';
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await UsersController.createUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User with this email already exists, please log in.',
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      req.oidc!.user!.email = 'auth0@example.com';
      const error = new Error('Database error');
      prisma.user.create.mockRejectedValue(error);

      await UsersController.createUser(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
