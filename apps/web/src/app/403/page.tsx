'use client';

import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f9f9f9] px-6 text-center text-neutral-900">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">403 Access denied</h1>
        <p className="text-sm text-neutral-600">Энэ хуудсыг харах эрхгүй байна.</p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-black px-5 py-2 text-sm text-white transition hover:opacity-90"
      >
        Буцах
      </Link>
    </main>
  );
}
