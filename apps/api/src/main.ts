import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { env } from '@yellowbook/config';
import { YellowBookList, YellowBookEntry, assertYellowBookList } from '@yellowbook/contract';

import { prisma } from './db';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// Helper: Prisma row -> Contract entry (strong types, no 'any')
type Row = Awaited<ReturnType<typeof prisma.yellowBook.findMany>>[number];
const toEntry = (r: Row): YellowBookEntry => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description ?? undefined,

  // Prisma returns string enums; cast them to the contract's union type.
  // (Make sure your Zod schema uses the same string values!)
  category: r.category as unknown as YellowBookEntry['category'],

  address: {
    city: r.city,
    district: r.district,
    street: r.street,
    building: r.building ?? undefined,
    postalCode: r.postalCode ?? undefined,
  },
  location: { lat: Number(r.lat), lng: Number(r.lng) },

  // JSON columns: cast to the contract shapes; Zod will validate at runtime.
  contacts: (r.contacts as unknown as YellowBookEntry['contacts']) ?? undefined,
  hours: (r.hours as unknown as YellowBookEntry['hours']) ?? undefined,
  photos: (r.photos as unknown as YellowBookEntry['photos']) ?? undefined,

  rating: r.rating ?? undefined,
  reviewCount: r.reviewCount,
  priceLevel: (r.priceLevel as unknown as YellowBookEntry['priceLevel']) ?? undefined,

  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

app.get('/yellow-books', async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.yellowBook.findMany({ orderBy: { createdAt: 'desc' } });

    const list: YellowBookList = rows.map(toEntry);

    // Validate with Zod (shared contract)
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
    const row = await prisma.yellowBook.findUnique({ where: { slug: req.params.slug } });
    if (!row) return res.status(404).json({ error: 'Not found' });

    const entry = toEntry(row);
    // Optional: validate single item with Zod:
    // YellowBookEntrySchema.parse(entry);

    res.setHeader('Cache-Control', 'no-store');
    res.json(entry);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    res.status(500).json({ error: msg });
  }
});

const port = env.API_PORT;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
