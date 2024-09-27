import { z } from 'zod';

const TaskStatus = z.enum(['TO_DO', 'IN_PROGRESS', 'DONE']);

const createTaskDTO = z.object({
  taskData: z.object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(100, { message: 'Title cannot be longer than 100 characters' }),
    desc: z
      .string()
      .max(500, { message: 'Description cannot be longer than 500 characters' })
      .optional(),
    boardId: z.string().uuid({ message: 'Board ID must be a non-negative integer' }),
    status: TaskStatus,
  }),
  subtaskData: z
    .object({
      id: z.string({ message: 'Subtask ID is required' }).uuid('Subtask ID must be a valid UUID'),
      desc: z
        .string()
        .min(1, { message: 'Description must be at least 1 character' })
        .max(200, { message: 'Description cannot be longer than 200 characters' }),
      finished: z.boolean(),
    })
    .array()
    .optional(),
});

export default createTaskDTO;
