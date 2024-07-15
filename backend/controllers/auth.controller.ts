import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import Auth0User from '../types/Auth0User';

const AuthController = {
  // fetch user by auth0 sub and attach userId from the db to the session
  // [TODO if the user does not exist in db redirect to post login form ]
  PostLogin: async (req: Request, res: Response, next: NextFunction) => {
    console.log('Callback route reached');
    const authUser = req.oidc.user as Auth0User;
    console.log(authUser.email);
    try {
      let user;
      if (authUser.email) {
        user = await prisma.user.findUnique({
          where: { email: authUser.email },
          select: {
            id: true,
          },
        });
      }

      // [TODO change to redirect to the post login form!]
      if (!user) user = { id: 'abc' };

      req.session.userId = user.id;
      console.log('user id added ' + req.session.userId);

      req.session.save((err) => {
        if (err) {
          return next(err);
        }
      });

      res.redirect('/profile');
    } catch (error) {
      next(error);
    }
  },

  Logout: (req: Request, res: Response) => {
    req.session.destroy((err: Error) => {
      console.log('session removed');
      if (err) {
        console.log('Error clearing session:', err);
      } else {
        res.clearCookie('connect.sid');
        // redirect to auth0 logout endpoint
        res.redirect('/logout');
      }
    });
  },
};

export default AuthController;
