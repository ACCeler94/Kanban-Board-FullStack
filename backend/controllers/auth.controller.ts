import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';

const AuthController = {
  // fetch user by auth0 sub and attach userId from the db to the session to authorize certain operations based on userId
  PostLogin: async (req: Request, res: Response, next: NextFunction) => {
    console.log('Callback route reached');

    const authUser = req.session.auth0User;

    // Check if user object is available in request
    if (!authUser || !authUser.sub) {
      return res
        .status(400)
        .json({ error: 'User information is missing or incomplete. Try again. ' });
    }

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

      if (!user)
        return res.redirect(
          process.env.NODE_ENV === 'production'
            ? '/post-login/user-form'
            : 'http://localhost:3000/post-login/user-form'
        );

      req.session.userId = user.id;

      // Save session and handle errors
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        res.status(200).json({ message: 'Session saved' });
      });
    } catch (error) {
      next(error);
    }
  },

  Logout: (req: Request, res: Response) => {
    req.session.destroy((err: Error) => {
      if (err) {
        console.log('Error clearing session:', err);
      } else {
        res.clearCookie('connect.sid');
      }
      // redirect to auth0 logout endpoint
      res.redirect(process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3000/');
    });
  },
};

export default AuthController;
