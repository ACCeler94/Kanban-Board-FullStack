import { z } from 'zod';

const createTaskDTO = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(255, { message: 'Title cannot be longer than 255 characters' }),
  desc: z.string().optional(),
  authorId: z.string().uuid({ message: 'Author ID must be a non-negative integer' }),
  boardId: z.string().uuid({ message: 'Board ID must be a non-negative integer' }),
});

export default createTaskDTO;
