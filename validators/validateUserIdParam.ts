import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const validateUserIdParam = (req: Request, res: Response, next: NextFunction) => {
  const UserIdParamSchema = z.object({
    userId: z.string().regex(/^\d+$/, { message: 'User ID must be a number' }),
  });

  try {
    UserIdParamSchema.parse(req.params); // Validate params against the schema
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
