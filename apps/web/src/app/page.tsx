import Image from 'next/image';
import Link from 'next/link';

import { fetchYellowBooks } from '../lib/yellowbook';

const categories = [
  'Ресторан',
  'Кафе',
  'Гоо сайхан',
  'Засвар',
  'Эмнэлэг',
  'Фитнес',
  'Банк',
  'Үйлчилгээний тов',
];

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5 text-neutral-800"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-2.9-2.9" strokeLinecap="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const list = await fetchYellowBooks();
  const featured = list.slice(0, 3);
  const hasFeatured = featured.length > 0;
  const testimonials = Array.from({ length: 4 });

  const fallbackPhoto =
    'https://images.unsplash.com/photo-1555992336-cbf5d5813933?auto=format&fit=crop&w=900&q=80';

  const featuredCards = hasFeatured
    ? featured.map((item, idx) => ({
        key: item.slug,
        linkHref: `/yellow-books/${item.slug}`,
        title: item.name,
        subtitle: `${item.address.district}, ${item.address.street}`,
        imageSrc: (item.photos?.[0] as string | undefined) ?? fallbackPhoto,
        priority: idx === 0,
      }))
    : Array.from({ length: 3 }, (_, idx) => ({
        key: `featured-placeholder-${idx}`,
        linkHref: '/yellow-books',
        title: 'Шинэ нээгдсэн газрууд',
        subtitle: 'Хамгийн эрэлттэй газрууд',
        imageSrc: fallbackPhoto,
        priority: idx === 0,
      }));

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-col px-6 pb-24">
        <header className="flex items-center justify-between border-b border-neutral-200 py-6">
          <Link href="/" className="text-lg font-semibold tracking-[0.24em] uppercase">
            ШАР НОМ
          </Link>
          <nav className="flex gap-8 text-sm">
            <Link href="/login" className="transition hover:text-neutral-600">
              Нэвтрэх
            </Link>
            <Link href="/register" className="transition hover:text-neutral-600">
              Бүртгүүлэх
            </Link>
          </nav>
        </header>

        <section className="flex flex-col items-center gap-8 py-16 text-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">УБ дахь бизнесээ олоорой</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Ресторан, гоо сайхан, авто засвар, эмнэлэг… бүгд нэг дор
            </p>
          </div>

          <form action="/yellow-books/search" method="get" className="w-full max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-3 shadow-sm focus-within:border-black focus-within:ring-2 focus-within:ring-neutral-900/10">
              <input
                type="search"
                name="q"
                placeholder="Хайх..."
                className="flex-1 rounded-full border-0 bg-transparent px-3 py-2 text-sm outline-none"
                aria-label="Бизнес хайх"
              />
              <button
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1c232]"
                aria-label="Хайх"
              >
                <SearchIcon />
              </button>
            </div>
          </form>

          <ul className="flex flex-wrap justify-center gap-3 text-sm text-neutral-700">
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/yellow-books/search?category=${encodeURIComponent(category)}`}
                  className="rounded-full bg-neutral-100 px-4 py-2 transition hover:bg-neutral-200"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Онцлох</h2>
            <Link href="/yellow-books" className="flex items-center gap-2 text-sm text-neutral-600">
              Бүгдийг харах
              <ArrowIcon />
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCards.map((card) => (
              <article
                key={card.key}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={card.imageSrc}
                    alt={card.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover"
                    priority={card.priority}
                    unoptimized
                  />
                </div>
                <div className="space-y-1 px-5 pb-5 pt-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Онцлох
                  </span>
                  <h3 className="text-base font-semibold text-neutral-900">{card.title}</h3>
                  <p className="text-sm text-neutral-600">{card.subtitle}</p>
                  <Link href={card.linkHref} className="inline-block pt-1 text-sm text-[#f1c232]">
                    Дэлгэрэнгүй
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Сэтгэгдлүүд</h2>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm"
                aria-label="Өмнөх сэтгэгдэл"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm"
                aria-label="Дараагийн сэтгэгдэл"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((_, idx) => (
              <div
                key={`testimonial-${idx}`}
                className="h-44 rounded-3xl border border-neutral-200 bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
