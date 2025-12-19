import express, { type Request, type Response, Router } from 'express';
import cors from 'cors';
import { env } from '@yellowbook/config';
import { assertYellowBookList } from '@yellowbook/contract';

import { yellowBooksAiRouter } from './routes/yellowbooks-ai.routes';
import { createYellowBooksStore } from './yellowbooks/store';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.use(['/ai', '/api/ai'], yellowBooksAiRouter);

app.get(['/health', '/api/health'], (_req: Request, res: Response) => res.json({ ok: true }));

const store = createYellowBooksStore();
const apiRouter = Router();

apiRouter.get('/yellow-books', async (_req: Request, res: Response) => {
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

apiRouter.get('/yellow-books/:slug', async (req: Request<{ slug: string }>, res: Response) => {
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

app.use('/', apiRouter);
app.use('/api', apiRouter);

const port = env.PORT;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
