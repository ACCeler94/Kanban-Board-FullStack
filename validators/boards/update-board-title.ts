import { z } from 'zod';

const UpdateBoardTitleDTO = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(255, { message: 'Title cannot be longer than 255 characters' }),
});

export default UpdateBoardTitleDTO;
