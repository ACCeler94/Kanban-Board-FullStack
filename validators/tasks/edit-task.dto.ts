import { z } from 'zod';

const TaskStatus = z.enum(['TO_DO', 'IN_PROGRESS', 'DONE']);

const editTaskDTO = z.object({
  title: z.string().max(255, { message: 'Title cannot be longer than 255 characters' }).optional(),
  desc: z.string().optional(),
  status: TaskStatus.optional(),
});

export default editTaskDTO;
