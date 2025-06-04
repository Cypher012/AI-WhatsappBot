import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY = z.string(),
  CLOUDINARY_API_SECRET = z.string(),
  FRONTEND_URL_1 = z.string().url(),
  FRONTEND_URL_2 = z.string().url(),
});

type EnvSchema = z.infer<typeof envSchema>;

declare module 'bun' {
  interface Env extends EnvSchema {}
}
