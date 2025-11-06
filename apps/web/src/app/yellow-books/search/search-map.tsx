'use client';

import { memo } from 'react';
import type { YellowBookEntry } from '@yellowbook/contract';

type Props = {
  items: YellowBookEntry[];
};

function SearchMapComponent({ items }: Props) {
  return (
    <div className="h-[420px] w-full rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-800">Газрын зураг</h2>
        <span className="text-xs text-neutral-500">
          {items.length} газрууд (client island дээр)
        </span>
      </header>
      <div className="grid h-full grid-cols-1 gap-3 overflow-auto sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.slug}
            className="rounded-2xl border border-neutral-200 p-3 text-sm text-neutral-700"
          >
            <p className="font-semibold text-neutral-900">{item.name}</p>
            <p className="text-xs uppercase tracking-wide text-neutral-500">{item.category}</p>
            <p className="mt-1 text-xs text-neutral-500">
              Lat: {item.location.lat.toFixed(4)}, Lng: {item.location.lng.toFixed(4)}
            </p>
          </article>
        ))}
        {items.length === 0 && (
          <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            Илэрцгүй байна.
          </div>
        )}
      </div>
    </div>
  );
}

const SearchMap = memo(SearchMapComponent);
SearchMap.displayName = 'SearchMap';

export default SearchMap;
