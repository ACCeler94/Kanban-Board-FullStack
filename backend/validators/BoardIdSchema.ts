import { z } from 'zod';

const BoardIdSchema = z.object({
  boardId: z.string({ message: 'Board ID is required' }).uuid('Board ID must be a valid UUID'),
});

export default BoardIdSchema;
