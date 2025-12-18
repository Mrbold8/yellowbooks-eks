'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

type YellowBookBusiness = {
  id: string | number;
  slug: string;
  name: string;
  city?: string | null;
  district?: string | null;
  categories?: string[] | null;
  description?: string | null;
};

type SearchResponse = {
  answer: string;
  businesses: YellowBookBusiness[];
};

export default function YellowBooksAssistantPage() {
  const [question, setQuestion] = useState(
    'Сүхбаатар дүүрэгт орой хүртэл ажилладаг кофе шоп олж өгөөч',
  );
  const [city, setCity] = useState('Улаанбаатар');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/yellow-books/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          city: city || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.error ||
          `Серверээс алдаа ирлээ. Статус код: ${res.status}`;
        throw new Error(message);
      }

      const data = (await res.json()) as SearchResponse;
      setResult(data);
    } catch (err: unknown) {
      console.error('AI search request failed', err);
      const message =
        err instanceof Error
          ? err.message
          : 'AI хайлт хийх явцад үл мэдэгдэх алдаа гарлаа. Дахин оролдоод үзнэ үү.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">
          YellowBooks – AI туслах
        </h1>
        <p className="text-sm text-gray-600">
          Байршил, төрөл, онцлог зэрэг мэдээллээ Монгол хэлээр энгийн
          өгүүлбэрээр асууж, AI -аас тохирох бизнесүүдийн санал
          аваарай.
        </p>
        <p className="text-xs text-gray-500">
          Жишээ: &ldquo;Сүхбаатар дүүрэгт орой хүртэл
          ажилладаг кофе шоп олж өгөөч&rdquo;
        </p>
      </section>

      {/* Form */}
      <section>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="space-y-2">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700"
            >
              Асуулт (Монгол хэлээр)
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
              placeholder="Жишээ: Чингэлтэй дүүрэгт өглөө эрт нээгддэг фитнесс клуб хайж байна"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              Хот (заавал биш)
            </label>
            <input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
              placeholder="Улаанбаатар"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? 'AI хайж байна…' : 'AI-аас асуух'}
            </button>

            <Link
              href="/yellow-books"
              className="text-xs text-gray-600 underline hover:text-black"
            >
              Энгийн жагсаалтаар харах
            </Link>
          </div>
        </form>
      </section>

      {/* Error state */}
      {error && (
        <section className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </section>
      )}

      {/* Loading hint */}
      {loading && !error && (
        <section className="text-sm text-gray-600">
          Асуултыг боловсруулж, тохирох бизнесүүдийг хайж байна…
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="space-y-4">
          {/* AI answer */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              AI-ийн санал болгож буй хариу
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
              {result.answer}
            </p>
          </div>

          {/* Businesses list */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Олдсон бизнесүүд
            </h3>

            {result.businesses.length === 0 && (
              <p className="text-sm text-gray-600">
                Тохирох бизнес олдсонгүй.
              </p>
            )}

            {result.businesses.length > 0 && (
              <ul className="space-y-3">
                {result.businesses.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-md border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/yellow-books/${b.slug}`}
                        className="text-sm font-medium text-black hover:underline"
                      >
                        {b.name}
                      </Link>
                      {(b.city || b.district) && (
                        <span className="text-xs text-gray-500">
                          {[b.city, b.district]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      )}
                    </div>

                    {b.categories && b.categories.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Ангилал:{' '}
                        {b.categories
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}

                    {b.description && (
                      <p className="mt-2 text-sm text-gray-700">
                        {b.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
