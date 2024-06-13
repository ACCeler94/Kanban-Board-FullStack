import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UsersController from '../../controllers/users.controller';
import prisma from '../../prisma/__mocks__/prisma';
import Auth0User from '../../types/Auth0User';
import { RequestContext } from 'express-openid-connect';

vi.mock('../../prisma/prisma.ts');

describe('UsersController', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    auth0Sub: 'auth0|123456789',
  };

  describe('getById', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: { userId: '1' },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return the user and status 200', async () => {
      const mockUserExtended = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        auth0Sub: 'auth0|123456789',
        assignedTasks: [],
        boards: [],
        authoredBoards: [],
        authoredTasks: [],
      };
      prisma.user.findUnique.mockResolvedValue(mockUserExtended);

      await UsersController.getById(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: req.params!.userId },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUserExtended);
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
      const mockUserArr = [
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

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 201 status and created user when email is provided in the request body object', async () => {
      (req.body as { name: string; email: string }).email = 'john@example.com';
      prisma.user.create.mockResolvedValue(mockUser);

      await UsersController.createUser(req as Request, res as Response, next);

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
