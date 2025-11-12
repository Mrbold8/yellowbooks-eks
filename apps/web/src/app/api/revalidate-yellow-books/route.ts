import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { YELLOW_BOOKS_TAG } from '../../../lib/cache-tags';

type Payload = {
  token?: string;
  slug?: string;
};

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'REVALIDATE_SECRET тохируулаагүй байна' }, { status: 500 });
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ message: 'JSON буруу байна' }, { status: 400 });
  }

  if (payload.token !== secret) {
    return NextResponse.json({ message: 'Token буруу' }, { status: 401 });
  }

  const slug = payload.slug;
  if (!slug) {
    return NextResponse.json({ message: 'slug талбарыг заавал өг' }, { status: 400 });
  }

  if (slug === 'all') {
    revalidateTag(YELLOW_BOOKS_TAG); // fetch response -ийн tag -ийг invalidate хийнэ. Fetch response -ийг шинэчлэхэд хэрэглэнэ.
    revalidatePath('/yellow-books'); // html болон data cache -ийг invalidate хийнэ. Шинэ list авахад хэрэглэнэ.
    return NextResponse.json({ revalidated: 'all', tags: [YELLOW_BOOKS_TAG] });
  }

  const path = `/yellow-books/${slug}`;
  revalidateTag(YELLOW_BOOKS_TAG); // fetch response -ийг шинэчлэхэд.
  revalidatePath('/yellow-books'); // шинэ list авахад хэрэглэнэ.
  revalidatePath(path);

  return NextResponse.json({ revalidated: path, tags: [YELLOW_BOOKS_TAG] });
}

// Жишээ нь

// curl -X POST http://localhost:3001/api/revalidate-yellow-books \
//   -H "Content-Type: application/json" \
//   -d '{
//     "token": "secret",
//     "slug": "coffee-house-sbd"
//   }'

// curl -X POST http://localhost:3001/api/revalidate-yellow-books \
//   -H "Content-Type: application/json" \
//   -d '{
//     "token": "secret",
//     "slug": "golden-cafe"
//   }'
