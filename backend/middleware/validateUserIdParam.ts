import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import UserIdSchema from '../validators/UserIdSchema';

const validateUserIdParam = (req: Request, res: Response, next: NextFunction) => {
  try {
    UserIdSchema.parse(req.params); // Validate params against the schema
    next(); // Proceed to the controller if valid
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    } else {
      next(error);
    }
  }
};

export default validateUserIdParam;
