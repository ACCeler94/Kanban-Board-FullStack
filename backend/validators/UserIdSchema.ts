import { z } from 'zod';

const UserIdSchema = z.object({
  userId: z.string({ message: 'User ID is required' }).uuid('User ID must be a valid UUID'),
});

export default UserIdSchema;
