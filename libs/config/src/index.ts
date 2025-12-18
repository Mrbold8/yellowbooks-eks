export * from './lib/config';
import { z } from 'zod';

const PortSchema = z.preprocess((value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}, z.number().int().positive().default(3000));

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DB_MODE: z.enum(['postgres', 'mock']).default('postgres'),
  // DATABASE_URL: z.string().url().optional(), // Prisma алхамд идэвхжүүлнэ
  // In Kubernetes, a Service named "api" injects env vars like `API_PORT=tcp://...`,
  // which would coerce to `NaN` and crash the process. Prefer `PORT` and only use
  // `API_PORT` if it is a valid number.
  PORT: PortSchema,
  API_PORT: PortSchema.optional(),
});

const parsed = EnvSchema.parse(process.env);

export const env = {
  NODE_ENV: parsed.NODE_ENV,
  DB_MODE: parsed.DB_MODE,
  PORT: parsed.PORT,
  API_PORT: parsed.API_PORT ?? parsed.PORT,
};
