import { z } from 'zod';

const SubtaskIdSchema = z.object({
  subtaskId: z
    .string({ message: 'Subtask ID is required' })
    .uuid('Subtask ID must be a valid UUID'),
});

export default SubtaskIdSchema;
