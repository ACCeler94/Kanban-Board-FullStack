import { z } from 'zod';

const TaskStatus = z.enum(['TO_DO', 'IN_PROGRESS', 'DONE']);

export const editTaskDTO = z
  .object({
    taskData: z
      .object({
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
      })
      .optional(),
    subtaskData: z
      .object({
        id: z.string({ message: 'Subtask ID is required' }).uuid('Subtask ID must be a valid UUID'),
        desc: z
          .string()
          .min(1, { message: 'Description must be at least 1 character' })
          .max(100, { message: 'Description cannot be longer than 280 characters' })
          .optional(),
        finished: z.boolean().optional(),
        order: z.number().optional(),
      })
      .array()
      .optional(),
    subtasksToRemove: z.string().array(),
  })
  .refine(
    (data) =>
      (data.taskData && Object.keys(data.taskData).length !== 0) ||
      (data.subtaskData && data.subtaskData.length > 0) ||
      (data.subtasksToRemove && data.subtasksToRemove.length > 0),
    {
      message: 'No changes detected. You must modify the task to save changes!',
    }
  );
