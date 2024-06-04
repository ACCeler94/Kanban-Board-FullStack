import { z } from 'zod';

const EmailSearchSchema = z.object({
  email: z.string().min(1).max(64),
});

export default EmailSearchSchema;
