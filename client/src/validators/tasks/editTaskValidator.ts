import { z } from 'zod';

const TaskStatus = z.enum(['TO_DO', 'IN_PROGRESS', 'DONE']);

const editTaskValidator = z
  .object({
    taskData: z
      .object({
        title: z
          .string()
          .min(1, { message: 'Title is required' })
          .max(100, { message: 'Title cannot be longer than 100 characters' })
          .optional(),
        desc: z
          .string()
          .max(500, { message: 'Description cannot be longer than 500 characters' })
          .optional(),
        status: TaskStatus.optional(),
      })
      .optional(),
    subtaskData: z
      .object({
        id: z.string().uuid().optional(),
        desc: z
          .string()
          .min(1, { message: 'Description must be at least 1 character' })
          .max(200, { message: 'Description cannot be longer than 200 characters' })
          .optional(),
        finished: z.boolean().optional(),
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
      message: 'No changes detected. You must modify the task to save changes.',
    }
  );

export default editTaskValidator;
