import { z } from 'zod';

const TaskIdSchema = z
  .object({
    taskId: z.string().uuid({ message: 'Task ID must be a valid UUID' }),
  })
  .strict(); // .strict() to ignore additional parameters;

export default TaskIdSchema;
