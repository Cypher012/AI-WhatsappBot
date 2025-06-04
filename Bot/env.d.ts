import z from 'zod';
import envSchema from '@/schema/env';

type EnvSchema = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {}
  }
}
