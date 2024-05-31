import { z } from 'zod';

const UserIdSchema = z
  .object({
    userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
  })
  .strict(); // .strict() to ignore additional parameters;

export default UserIdSchema;
