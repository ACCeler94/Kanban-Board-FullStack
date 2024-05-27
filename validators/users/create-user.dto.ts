import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createUserDTO = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(36, { message: 'Name cannot be longer than 36 characters' }),
  email: z.string().regex(emailRegex, 'Invalid email format'),
});

export default createUserDTO;
