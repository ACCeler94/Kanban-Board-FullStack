import { z } from 'zod';

const createBoardDTO = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  authorId: z.number().int().nonnegative({ message: 'Author ID must be a non-negative integer' }),
});

export default createBoardDTO;
