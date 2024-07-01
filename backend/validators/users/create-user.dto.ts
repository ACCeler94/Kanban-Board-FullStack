import { z } from 'zod';

const createUserDTO = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(36, { message: 'Name cannot be longer than 36 characters' }),
  email: z.string().email('Invalid email format').optional(),
});

export default createUserDTO;
