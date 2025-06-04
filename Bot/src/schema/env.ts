import z from 'zod';

const envSchema = z.object({
  BASE_URL: z.string().url(),
});

export default envSchema;
