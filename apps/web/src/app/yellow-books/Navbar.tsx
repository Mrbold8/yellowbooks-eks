import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/yellow-books" className="hover:underline">
        Жагсаалт
      </Link>
      <Link href="/yellow-books/assistant" className="hover:underline">
        AI туслагч
      </Link>
    </nav>
  );
}
