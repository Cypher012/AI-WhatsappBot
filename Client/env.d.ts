import z from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = z.string(),
  NEXT_PUBLIC_CLOUDINARY_API_KEY = z.string(),
  CLOUDINARY_API_SECRET = z.string(),
  NEXT_PUBLIC_BASE_URL: z.string(),
});

type EnvSchema = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {}
  }
}
