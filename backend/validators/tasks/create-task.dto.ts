import { z } from 'zod';

const createTaskDTO = z.object({
  taskData: z.object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(100, { message: 'Title cannot be longer than 100 characters' }),
    desc: z.string().optional(),
    boardId: z.string().uuid({ message: 'Board ID must be a non-negative integer' }),
  }),
  subtaskData: z
    .object({
      desc: z
        .string()
        .min(1, { message: 'Description must be at least 1 character' })
        .max(100, { message: 'Description cannot be longer than 280 characters' }),
    })
    .array()
    .optional(),
});

export default createTaskDTO;
