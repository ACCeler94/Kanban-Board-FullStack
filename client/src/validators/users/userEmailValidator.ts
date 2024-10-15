import { z } from 'zod';

const userEmailValidator = z.object({
  email: z.string().min(1).max(64).email(),
});

export default userEmailValidator;
