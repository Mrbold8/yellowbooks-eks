// apps/api/src/routes/yellowbooks-ai.routes.ts
import { Router, Request, Response } from 'express';

import { searchYellowBooks } from '../ai/yellow-books/search/service';

export const yellowBooksAiRouter = Router();

function getHfErrorInfo(err: unknown): { status?: number; message?: string } {
  if (!err || typeof err !== 'object') return {};
  const anyErr = err as any;
  const status = anyErr?.httpResponse?.status;
  const message =
    anyErr?.httpResponse?.body?.error ??
    anyErr?.error?.message ??
    anyErr?.message ??
    undefined;

  const info: { status?: number; message?: string } = {};
  if (typeof status === 'number') info.status = status;
  if (typeof message === 'string') info.message = message;
  return info;
}

/**
 * POST /api/ai/yellow-books/search
 *
 * Body: { "question": string, "city"?: string }
 *
 * Returns: { "answer": string, "businesses": [...] }
 */
yellowBooksAiRouter.post(
  '/yellow-books/search',
  async (req: Request, res: Response) => {
    try {
      const { question, city } = req.body ?? {};

      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          error: 'Missing or invalid "question" in request body.',
        });
      }

      const result = await searchYellowBooks(question, city);

      return res.json({
        answer: result.answer,
        businesses: result.businesses,
      });
    } catch (err) {
      console.error('Error in /api/ai/yellow-books/search:', err);
      const hf = getHfErrorInfo(err);
      const isAuthError = hf.status === 401 || hf.status === 403;
      const status = isAuthError ? 401 : 500;

      // In development, return the underlying provider message to make debugging easier.
      const debug =
        process.env.NODE_ENV !== 'production'
          ? {
              details: hf.message ?? (err instanceof Error ? err.message : String(err)),
              providerStatus: hf.status,
            }
          : undefined;

      return res.status(status).json({
        error: isAuthError
          ? 'Hugging Face authentication failed. Check your API token.'
          : 'Internal server error while processing AI search request.',
        ...debug,
      });
    }
  },
);
