import { z } from 'zod';

const createTaskDTO = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(100, { message: 'Title cannot be longer than 100 characters' }),
  desc: z.string().optional(),
  boardId: z.string().uuid({ message: 'Board ID must be a non-negative integer' }),
});

export default createTaskDTO;
