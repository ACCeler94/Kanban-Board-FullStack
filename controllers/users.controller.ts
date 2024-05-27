import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import createUserDTO from '../validators/users/create-user.dto';

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

  // returns array of users to allow partial searching
  findByEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailQuery = req.query.email as string;

      const users = await prisma.user.findMany({
        where: {
          email: {
            contains: emailQuery,
          },
        },
      });

      if (users.length === 0) {
        return res.status(404).json({ message: 'No users found...' });
      }

      return res.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  },

  createUser: async (req: Request, res: Response, next: NextFunction) => {
    let userData;
    try {
      userData = createUserDTO.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // check if the user with this email exists in the database (emails should be unique based on User schema)
    try {
      const user = await prisma.user.findUnique({ where: { email: userData.email } });
      if (user) return res.status(400).json({ error: 'User already exists.' });

      const createdUser = await prisma.user.create({ data: userData });

      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  },
};

export default UsersController;
