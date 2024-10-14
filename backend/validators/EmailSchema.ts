import { z } from 'zod';

const EmailSchema = z.object({
  email: z.string().min(1).max(64).email(),
});

export default EmailSchema;
