import { z } from 'zod';

const TaskStatus = z.enum(['TO_DO', 'IN_PROGRESS', 'DONE']);

const editTaskDTO = z.object({
  title: z
    .string()
    .min(1, { message: 'Title must be at least 1 character' })
    .max(100, { message: 'Title cannot be longer than 100 characters' })
    .optional(),
  desc: z
    .string()
    .min(1, { message: 'Title must be at least 1 character' })
    .max(1000, { message: 'Description cannot be longer than 1000 characters' })
    .optional(),
  status: TaskStatus.optional(),
});

export default editTaskDTO;
