import { z } from 'zod';

const createBoardDTO = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(255, { message: 'Title cannot be longer than 255 characters' }),
  authorId: z.number().int().nonnegative({ message: 'Author ID must be a non-negative integer' }),
});

export default createBoardDTO;
