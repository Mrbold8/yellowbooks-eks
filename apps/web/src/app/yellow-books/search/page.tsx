import Link from 'next/link';
import { Suspense } from 'react';

import { fetchYellowBooks } from '../../../lib/yellowbook';
import { YELLOW_BOOKS_TAG } from '../../../lib/cache-tags';

// Энэ page бүрэн SSR. Maps нь client island -аар ажиллана.
import SearchMap from './search-map';

type SearchParams = {
  q?: string;
  category?: string;
};

export const dynamic = 'force-dynamic';

type YellowBookSearchProps = { searchParams: Promise<SearchParams> };

export default async function YellowBookSearchPage({ searchParams }: YellowBookSearchProps) {
  const resolved = await searchParams;
  const query = (resolved.q ?? '').trim().toLowerCase();
  const category = (resolved.category ?? '').trim().toLowerCase();
  const list = await fetchYellowBooks({
    cache: 'no-store',
    tags: [YELLOW_BOOKS_TAG],
  });

  const filtered = list.filter((item) => {
    const matchQuery =
      query.length === 0 ||
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.address.district.toLowerCase().includes(query) ||
      item.address.street.toLowerCase().includes(query);

    const matchCategory = category.length === 0 || item.category?.toLowerCase() === category;

    return matchQuery && matchCategory;
  });

  return (
    <main className="mx-auto flex flex-col gap-8 px-6 py-10 lg:flex-row lg:gap-10 lg:px-12">
      <section className="w-full lg:w-2/5">
        <header>
          <h1 className="text-2xl font-semibold text-neutral-900">Yellow Book хайлт</h1>
          <p className="text-sm text-neutral-500">SSR + client map island</p>
        </header>

        <form method="get" className="mt-6 space-y-4">
          <div>
            <label htmlFor="search" className="text-xs font-medium uppercase text-neutral-500">
              Хайх үг
            </label>
            <input
              id="search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Жишээ: кофе, гоо сайхан..."
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-400/40"
            />
          </div>

          <div>
            <label htmlFor="category" className="text-xs font-medium uppercase text-neutral-500">
              Ангилал
            </label>
            <input
              id="category"
              name="category"
              type="text"
              defaultValue={category}
              placeholder="Жишээ: ресторан"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-400/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              Хайх
            </button>
            <Link
              href="/yellow-books/search"
              className="text-sm text-neutral-500 underline underline-offset-4"
            >
              Шүүлтүүр арилгах
            </Link>
          </div>
        </form>

        <p className="mt-6 text-xs text-neutral-500">
          Илэрц: <span className="font-semibold text-neutral-700">{filtered.length}</span>
        </p>

        <ul className="mt-4 space-y-3">
          {filtered.map((item) => (
            <li key={item.slug} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex flex-col gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">{item.name}</h2>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    {item.category}
                  </p>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {item.description ?? 'Тайлбар оруулаагүй'}
                </p>
                <p className="text-sm text-neutral-500">
                  {item.address.district}, {item.address.street}
                </p>
                <Link
                  href={`/yellow-books/${item.slug}`}
                  className="text-sm font-medium text-neutral-900 underline"
                >
                  Дэлгэрэнгүй харах
                </Link>
              </div>
            </li>
          ))}

          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
              Илэрц олдсонгүй.
            </li>
          )}
        </ul>
      </section>

      <section className="w-full lg:w-3/5">
        <Suspense fallback={<MapSkeleton />}>
          <SearchMap items={filtered} />
        </Suspense>
      </section>
    </main>
  );
}

function MapSkeleton() {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
      Газрын зураг ачаалж байна...
    </div>
  );
}
