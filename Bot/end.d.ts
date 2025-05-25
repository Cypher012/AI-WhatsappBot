import z from 'zod';

const envSchema = z.object({
    BASE_URL = z.string().url()
});

type EnvSchema = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {}
  }
}
