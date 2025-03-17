import { z } from 'zod';

const UpdateBoardTitleDTO = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(100, { message: 'Title cannot be longer than 100 characters' }),
});

export default UpdateBoardTitleDTO;
