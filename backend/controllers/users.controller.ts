import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import createUserDTO from '../validators/users/create-user.dto';
import Auth0User from '../types/Auth0User';
import EmailSearchSchema from '../validators/EmailSearchSchema';

const UsersController = {
  // GET
  // [TODO - delete this endpoint for production]
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({ include: { boards: true, assignedTasks: true } });

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) return res.status(404).json({ error: 'User not found...' });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  getByIdExtended: async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    // allow only the user to get this information

    const requestAuthorId = req.session.userId;

    if (!requestAuthorId) return res.status(400).json({ error: 'Invalid user data.' });

    if (userId !== requestAuthorId) return res.status(403).json({ error: 'Access Forbidden!' });

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          assignedTasks: true,
          boards: true,
          authoredBoards: true,
          authoredTasks: true,
        },
      });

      if (!user) return res.status(404).json({ error: 'User not found...' });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  getBySub: async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.oidc.user as Auth0User;

    // Check if user object is available in request
    if (!authUser || !authUser.sub) {
      return res
        .status(400)
        .json({ error: 'User information is missing or incomplete. Try again. ' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { auth0Sub: authUser.sub } });

      if (!user) return res.status(404).json({ error: 'User not found...' });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  findByEmail: async (req: Request, res: Response, next: NextFunction) => {
    let searchQuery;

    if (!req.query || !req.query.email)
      return res.status(400).json({ error: 'Invalid search query.' });

    try {
      searchQuery = EmailSearchSchema.parse(req.query);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid search query.' });
    }

    const emailQuery = searchQuery.email;

    try {
      const users = await prisma.user.findMany({
        where: {
          email: {
            contains: emailQuery,
          },
        },
        select: {
          name: true,
          email: true,
        },
      });

      if (users.length === 0) {
        return res.status(404).json({ error: 'No users found...' });
      }

      return res.status(200).json(users);
    } catch (error) {
      return next(error);
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
    const authUser = req.oidc.user as Auth0User;

    // Check if user object is available in request
    if (!authUser || !authUser.sub) {
      return res.status(400).json({ error: 'User information is incomplete. Try again. ' });
    }
    const sub: string = authUser.sub;

    // if the email is provided by auth0 then save it, otherwise save the email provided by the user in the registration form (userData) - the form will prompt for email only if it is not provided by auth0
    if (authUser.email) {
      email = authUser.email;
    } else if (!authUser.email && userData.email) {
      email = userData.email;
    } else {
      return res.status(400).json({ error: 'User information is incomplete. Try again.' });
    }

    try {
      // check if the user with this email exists in the database - check is done with email not sub as user might use different social login method which will provide different sub but the same email
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
