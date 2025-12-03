import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { fetchYellowBooks } from '../../lib/yellowbook';
import { YELLOW_BOOKS_TAG } from '../../lib/cache-tags';

// list -ийг 60 секунд тутамд ISR -р шинэчлэх
export const revalidate = 60;

const fallbackPhoto = 'https://placehold.co/96x96?text=No+Photo';

export default function YellowBooksPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Шар ном — Бизнесүүд</h1>
      </header>

      <Suspense fallback={<ListSkeleton />}>
        {/* Suspense нь жагсаалтыг stream болгон илгээж хэрэглэгчид хурдан харуулна */}
        <YellowBookList />
      </Suspense>
    </main>
  );
}

async function YellowBookList() {
  try {
    const list = await fetchYellowBooks({ revalidate, tags: [YELLOW_BOOKS_TAG] });

    return (
      <ul className="space-y-4" aria-label="Business list">
        {list.map((item) => (
          <li key={item.slug} className="rounded-2xl border p-4 hover:shadow">
            <div className="flex items-start gap-4">
              <Image
                src={(item.photos?.[0] as string | undefined) ?? fallbackPhoto}
                alt={item.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-xl object-cover"
                unoptimized
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  <Link className="underline" href={`/yellow-books/${item.slug}`}>
                    {item.name}
                  </Link>
                </h2>
                <p className="text-xs uppercase tracking-wide text-gray-500">{item.category}</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {item.description ?? 'Тайлбар оруулаагүй'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {item.address.district}, {item.address.street}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  } catch (error) {
    console.warn('yellow-books list fallback:', error);

    // return (
    //   <div className="rounded-2xl border border-dashed p-6 text-sm text-gray-500">
    //     Yellowbook service холбогдохгүй байна. Дараа дахин оролдоно уу.
    //   </div>
    // );
  }
}

function ListSkeleton() {
  return (
    <ul className="space-y-4" aria-label="Business list loading">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={`skeleton-${index}`} className="rounded-2xl border p-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-24 w-24 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-200" />
              <div className="h-3 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-2/4 rounded bg-gray-200" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
