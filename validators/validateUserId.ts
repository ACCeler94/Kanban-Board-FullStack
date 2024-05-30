import { z } from 'zod';

const UserIdSchema = z.object({
  userId: z.string().uuid(),
});

export default UserIdSchema;
