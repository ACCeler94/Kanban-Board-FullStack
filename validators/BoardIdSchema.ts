import { z } from 'zod';

const BoardIdSchema = z
  .object({
    userId: z.string().uuid({ message: 'Board ID must be a valid UUID' }),
  })
  .strict(); // .strict() to ignore additional parameters;

export default BoardIdSchema;
