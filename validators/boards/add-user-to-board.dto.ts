import { z } from 'zod';

const addUserToBoardDTO = z.object({
  userId: z.number().int().nonnegative({ message: 'User ID must be a non-negative integer' }),
});

export default addUserToBoardDTO;
