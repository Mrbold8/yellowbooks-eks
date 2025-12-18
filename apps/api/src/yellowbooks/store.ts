import fs from 'node:fs';
import path from 'node:path';

import { env } from '@yellowbook/config';
import {
  assertYellowBookList,
  type YellowBookEntry,
  type YellowBookList,
} from '@yellowbook/contract';
import type { Prisma } from '@prisma/client';

import { getPrismaClient } from '../db';

export type YellowBooksStore = {
  list: () => Promise<YellowBookList>;
  getBySlug: (slug: string) => Promise<YellowBookEntry | null>;
};

function resolveMockDataPath(): string {
  const candidates = [
    process.env.YELLOWBOOKS_DATA_PATH,
    path.join(process.cwd(), 'apps/api/data/yellow-books.json'),
    path.join(process.cwd(), 'dist/apps/api/data/yellow-books.json'),
  ].filter((p): p is string => typeof p === 'string' && p.length > 0);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return path.join(process.cwd(), 'apps/api/data/yellow-books.json');
}

function createMockStore(): YellowBooksStore {
  let cached: YellowBookList | null = null;

  async function getList(): Promise<YellowBookList> {
    if (cached) return cached;
    const jsonPath = resolveMockDataPath();
    const raw = await fs.promises.readFile(jsonPath, 'utf8');
    const data = JSON.parse(raw) as unknown;
    cached = assertYellowBookList(data);
    return cached;
  }

  return {
    list: getList,
    async getBySlug(slug: string) {
      const list = await getList();
      return list.find((entry) => entry.slug === slug) ?? null;
    },
  };
}

const yellowBookSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  category: true,
  city: true,
  district: true,
  street: true,
  building: true,
  postalCode: true,
  lat: true,
  lng: true,
  contacts: true,
  hours: true,
  photos: true,
  rating: true,
  reviewCount: true,
  priceLevel: true,
  createdAt: true,
  updatedAt: true,
} as const;

type Row = Prisma.YellowBookGetPayload<{ select: typeof yellowBookSelect }>;

function toEntry(row: Row): YellowBookEntry {
  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    category: row.category as unknown as YellowBookEntry['category'],
    address: {
      city: row.city,
      district: row.district,
      street: row.street,
      building: row.building ?? undefined,
      postalCode: row.postalCode ?? undefined,
    },
    location: { lat: Number(row.lat), lng: Number(row.lng) },
    contacts: (row.contacts as unknown as YellowBookEntry['contacts']) ?? undefined,
    hours: (row.hours as unknown as YellowBookEntry['hours']) ?? undefined,
    photos: (row.photos as unknown as YellowBookEntry['photos']) ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.reviewCount,
    priceLevel: (row.priceLevel as unknown as YellowBookEntry['priceLevel']) ?? undefined,
    createdAt: row.createdAt?.toISOString?.() ?? undefined,
    updatedAt: row.updatedAt?.toISOString?.() ?? undefined,
  };
}

function createPostgresStore(): YellowBooksStore {
  return {
    async list() {
      const prisma = getPrismaClient();
      const rows = await prisma.yellowBook.findMany({
        orderBy: { createdAt: 'desc' },
        select: yellowBookSelect,
      });
      return assertYellowBookList(rows.map(toEntry));
    },
    async getBySlug(slug: string) {
      const prisma = getPrismaClient();
      const row = await prisma.yellowBook.findUnique({
        where: { slug },
        select: yellowBookSelect,
      });
      return row ? toEntry(row) : null;
    },
  };
}

export function createYellowBooksStore(): YellowBooksStore {
  return env.DB_MODE === 'mock' ? createMockStore() : createPostgresStore();
}
