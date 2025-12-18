import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { env } from '@yellowbook/config';
import { assertYellowBookList } from '@yellowbook/contract';

import { yellowBooksAiRouter } from './routes/yellowbooks-ai.routes';
import { createYellowBooksStore } from './yellowbooks/store';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// After app.use(express.json()), add:
app.use('/api/ai', yellowBooksAiRouter);

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

const store = createYellowBooksStore();

app.get('/yellow-books', async (_req: Request, res: Response) => {
  try {
    const list = await store.list();
    const safe = assertYellowBookList(list);
    res.setHeader('Cache-Control', 'no-store');
    res.json(safe);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    res.status(500).json({ error: msg });
  }
});

app.get('/yellow-books/:slug', async (req: Request<{ slug: string }>, res: Response) => {
  try {
    const entry = await store.getBySlug(req.params.slug);
    if (!entry) return res.status(404).json({ error: 'Not found' });

    res.setHeader('Cache-Control', 'no-store');
    res.json(entry);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    res.status(500).json({ error: msg });
  }
});

const port = env.PORT;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
