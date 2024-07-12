import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import Auth0User from '../types/Auth0User';
import { auth0Config } from '../server';

const AuthController = {
  // fetch user by auth0 sub and attach userId from the db to the session
  // [TODO if the user does not exist in db redirect to post login form ]
  PostLogin: async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.oidc.user as Auth0User;
    try {
      let user;
      if (authUser.email) {
        user = await prisma.user.findUnique({
          where: { email: authUser.email },
          select: {
            id: true,
          },
        });
      } else {
        user = await prisma.user.findUnique({
          where: { auth0Sub: authUser.sub },
          select: {
            id: true,
          },
        });
      }

      if (!user) return res.status(404).json({ error: 'User not found... Try again.' });

      req.session.userId = user.id;
    } catch (error) {
      next(error);
    }
  },

  Logout: (req: Request, res: Response) => {
    const returnTo = encodeURIComponent(auth0Config.baseURL as string);
    const logoutURL = `https://${auth0Config.issuerBaseURL}/v2/logout?client_id=${auth0Config.clientID}&returnTo=${returnTo}`;

    req.session.destroy((err: Error) => {
      if (err) {
        console.log('Error clearing session:', err);
      }

      res.redirect(logoutURL);
    });
  },
};

export default AuthController;
