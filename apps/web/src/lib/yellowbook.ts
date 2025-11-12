import type { YellowBookList, YellowBookEntry } from '@yellowbook/contract';

// FetchConfig нь cache, revalidate, tags зэрэг Next тохиргоог дамжуулахад хэрэглэгдэнэ.
type FetchConfig = {
  cache?: RequestCache;
  /**
   * Next.js ISR / route-cache invalidation. (+ on-demand revalidation)
   */
  revalidate?: number;
  tags?: string[];
};

type NextAwareRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

const API_BASE =
  process.env.API_BASE ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

// buildRequestInit нь өгөгдсөн сонголтоор fetch -ийн init бэлдэж, Next тохиргоог тохируулна.
function buildRequestInit(options?: FetchConfig): NextAwareRequestInit {
  const { cache, revalidate, tags } = options ?? {};

  const init: NextAwareRequestInit = {};

  if (cache) {
    init.cache = cache;
  } else if (typeof revalidate === 'undefined') {
    init.cache = 'no-store';
  }

  if (typeof revalidate !== 'undefined' || (tags && tags.length > 0)) {
    init.next = {};
    if (typeof revalidate !== 'undefined') {
      init.next.revalidate = revalidate;
    }
    if (tags && tags.length > 0) {
      init.next.tags = tags;
    }
  }

  return init;
}

export async function fetchYellowBooks(options?: FetchConfig): Promise<YellowBookList> {
  const res = await fetch(`${API_BASE}/yellow-books`, buildRequestInit(options));
  if (!res.ok) throw new Error(`Failed to fetch list: ${res.status}`);
  return (await res.json()) as YellowBookList;
}

export async function fetchYellowBook(
  slug: string,
  options?: FetchConfig,
): Promise<YellowBookEntry> {
  const res = await fetch(`${API_BASE}/yellow-books/${slug}`, buildRequestInit(options));
  if (res.status === 404) throw new Error('Not found');
  if (!res.ok) throw new Error(`Failed to fetch item: ${res.status}`);
  return (await res.json()) as YellowBookEntry;
}
