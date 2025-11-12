// apps/web/app/yellow-books/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Олдсонгүй</h1>
      <p className="text-sm text-gray-600">Уучлаарай, хайсан бизнес олдсонгүй.</p>
      <a href="/yellow-books" className="underline">
        Жагсаалт руу буцах
      </a>
    </main>
  );
}
