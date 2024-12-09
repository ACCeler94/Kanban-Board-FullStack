import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import createUserDTO from '../validators/users/create-user.dto';

const UsersController = {
  // GET
  getById: async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
        },
      });

      if (!user) return res.status(404).json({ error: 'User not found...' });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  getUserBoards: async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.userId;

    if (!userId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      const user = await prisma.user.findUnique({
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

      if (!user) return res.status(404).json({ error: 'User not found...' });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  getUserData: async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.userId;

    if (!userId) return res.status(400).json({ error: 'Invalid user data.' });

    try {
      const user = await prisma.user.findUnique({
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

      if (!user) return res.status(404).json({ error: 'User not found...' });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req: Request, res: Response, next: NextFunction) => {
    let userData;
    let email: string;
    try {
      userData = createUserDTO.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid user data.' });
    }

    const { name } = userData;
    const authUser = req.session.auth0User;

    // Check if user object is available in request
    if (!authUser || !authUser.sub) {
      return res.status(400).json({ error: 'User information is incomplete. Try again. ' });
    }
    const sub: string = authUser.sub;

    // If the email is provided by auth0 then save it, otherwise save the email provided by the user in the registration form (userData) - the form will prompt for email only if it is not provided by auth0
    if (authUser.email) {
      email = authUser.email;
    } else if (!authUser.email && userData.email) {
      email = userData.email;
    } else {
      return res.status(400).json({ error: 'User information is incomplete. Try again.' });
    }

    try {
      // Check if the user with this email exists in the database - check is done with email not sub as user might use different social login method which will provide different sub but the same email
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res
          .status(409)
          .json({ error: 'User with this email already exists, please log in.' });
      }
      const createdUser = await prisma.user.create({
        data: {
          name,
          email,
          auth0Sub: sub,
        },
      });

      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  },
};

export default UsersController;
