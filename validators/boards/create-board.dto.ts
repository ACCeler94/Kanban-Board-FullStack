import { z } from 'zod';

const createBoardDTO = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(255, { message: 'Title cannot be longer than 255 characters' }),
  authorId: z.string().uuid({ message: 'Author ID must be a valid userId' }),
});

export default createBoardDTO;
