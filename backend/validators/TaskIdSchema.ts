import { z } from 'zod';

const TaskIdSchema = z.object({
  taskId: z.string({ message: 'Task ID is required' }).uuid('Task ID must be a valid UUID'),
});

export default TaskIdSchema;
