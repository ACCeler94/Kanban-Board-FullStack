/* eslint-disable @typescript-eslint/unbound-method */
import { Request, Response, NextFunction } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '../../prisma/__mocks__/prisma';
import Auth0User from '../../types/Auth0User';
import { Session, SessionData } from 'express-session';
import AuthController from '../../controllers/auth.controller';
import * as saveAvatarUtils from '../../utils/saveAvatar';
import * as deleteAvatarUtils from '../../utils/deleteAvatar';

vi.mock('../../prisma/prisma.ts');

const saveAvatarSpy = vi.spyOn(saveAvatarUtils, 'saveAvatar');
const deleteAvatarSpy = vi.spyOn(deleteAvatarUtils, 'deleteAvatar');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const auth0User: Auth0User = {
    sub: 'auth0|123',
    name: 'Test User',
    email: 'test@example.com',
    picture: 'abc.jpeg',
  };

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      session: {} as Session & Partial<SessionData>,
      headers: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn() as unknown as NextFunction;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('postLogin', () => {
    it('should return status 400 and "User information is missing or incomplete. Try again." error if req.session.auth0User or auth0User.sub is falsy', async () => {
      req.session!.auth0User = { ...auth0User, sub: '' };

      await AuthController.postLogin(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User information is missing or incomplete. Try again.',
      });
    });

    it('should update user avatar if it exists in the db and it changed', async () => {
      req.session!.auth0User = auth0User;
      const user = {
        name: 'John',
        auth0Sub: '12455',
        email: 'test@example.com',
        id: '1234',
        picture:
          'lh3_googleusercontent_com_a_ACg8ocJnKucGUckPYzMgMqRABe7_QgIIPUX_caPK0rURrDAyrrNwaw_s96_c.png',
      };
      prisma.user.findUnique.mockResolvedValue(user);
      saveAvatarSpy.mockResolvedValueOnce(auth0User.picture!); // Simulate success and return file name to save in the db

      await AuthController.postLogin(req as Request, res as Response, next);

      expect(saveAvatarSpy).toHaveBeenCalled();
      expect(deleteAvatarSpy).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { picture: auth0User.picture },
      });
    });

    it('should only save the avatar if the user does not exist in the db', async () => {
      req.session!.auth0User = auth0User;
      prisma.user.findUnique.mockResolvedValue(null);
      saveAvatarSpy.mockResolvedValueOnce(auth0User.picture! + '.jpeg'); // Simulate success and return file name to save in the db

      await AuthController.postLogin(req as Request, res as Response, next);

      expect(saveAvatarSpy).toHaveBeenCalled();
      expect(deleteAvatarSpy).not.toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: auth0User.email!,
          name: auth0User.name!,
          auth0Sub: auth0User.sub,
          picture: auth0User.picture + '.jpeg',
        },
      });
    });

    it('should not save an image and save user without it if it was not provided', async () => {
      const userWithoutAvatar = { sub: 'auth0|123', name: 'Test User', email: 'test@example.com' };
      req.session!.auth0User = userWithoutAvatar;
      prisma.user.findUnique.mockResolvedValue(null);

      await AuthController.postLogin(req as Request, res as Response, next);

      expect(saveAvatarSpy).not.toHaveBeenCalled();
      expect(deleteAvatarSpy).not.toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userWithoutAvatar.email,
          name: userWithoutAvatar.name,
          auth0Sub: userWithoutAvatar.sub,
        },
      });
    });

    it('should return status 200 and message "Session saved"', async () => {
      req.session!.auth0User = auth0User;
      const user = {
        name: 'John',
        auth0Sub: '1auth0|123',
        email: 'test@example.com',
        id: '1234',
        picture: auth0User.picture!,
      };
      prisma.user.findUnique.mockResolvedValue(user);
      req.session!.save = vi.fn((cb?: (err?: Error) => void) => {
        if (cb) cb(); // Simulate callback execution
      }) as unknown as (callback?: (err?: Error) => void) => Session & Partial<SessionData>;

      await AuthController.postLogin(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Session saved' });
      expect(req.session?.userId).toBe(user.id);
    });

    describe('logout', () => {
      beforeEach(() => {
        req = {
          session: {} as Session & Partial<SessionData>,
        };

        res = {
          clearCookie: vi.fn(),
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };
      });

      it('should destroy the session, clear cookie, and return 204', () => {
        req.session!.destroy = vi.fn((cb?: (err?: Error) => void) => {
          if (cb) cb(); // Simulate callback execution
        }) as unknown as (callback?: (err?: Error) => void) => Session & Partial<SessionData>;

        AuthController.logout(req as Request, res as Response);

        expect(req.session!.destroy).toHaveBeenCalled();
        expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
      });

      it('should still return 204 even if session destruction fails', () => {
        const error = new Error('Destroy failed');
        vi.spyOn(console, 'log').mockImplementation(() => {}); // Silence console log

        req.session!.destroy = vi.fn((cb?: (err?: Error) => void) => {
          if (cb) cb(error);
        }) as unknown as (callback: (err: Error) => void) => Session & Partial<SessionData>;

        AuthController.logout(req as Request, res as Response);

        expect(req.session!.destroy).toHaveBeenCalled();
        expect(res.clearCookie).not.toHaveBeenCalled(); // No cookie cleared on error
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
      });
    });
  });
});
