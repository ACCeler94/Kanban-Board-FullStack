import { z } from 'zod';

const removeUserFromBoardDTO = z.object({
  userId: z.number().int().nonnegative({ message: 'User ID must be a non-negative integer' }),
});

export default removeUserFromBoardDTO;
