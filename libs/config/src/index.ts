export * from './lib/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // DATABASE_URL: z.string().url().optional(), // Prisma алхамд идэвхжүүлнэ
  API_PORT: z.coerce.number().default(3000),
});

export const env = EnvSchema.parse(process.env);
