import Image from 'next/image';
import { notFound } from 'next/navigation';

import { fetchYellowBook, fetchYellowBooks } from '../../../lib/yellowbook';
import { YELLOW_BOOKS_TAG } from '../../../lib/cache-tags';

export const dynamic = 'error'; // энэ хуудас build үеэр бүрэн statically үүснэ
export const dynamicParams = true; // build үед slug жагсаалт олдоогүй бол runtime дээр fallback хийнэ

const fallbackPhoto = 'https://placehold.co/600x400?text=No+Photo';

type YellowBookPageProps = { params: Promise<{ slug: string }> };

export default async function YellowBookDetail({ params }: YellowBookPageProps) {
  try {
    const { slug } = await params;
    const item = await fetchYellowBook(slug, {
      cache: 'force-cache',
      tags: [YELLOW_BOOKS_TAG],
    });

    // const center = `${item.location.lat},${item.location.lng}`;
    // const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${item.location.lng - 0.01}%2C${item.location.lat - 0.01}%2C${item.location.lng + 0.01}%2C${item.location.lat + 0.01}&layer=mapnik&marker=${center}`;

    return (
      <main className="max-w-3xl mx-auto p-6">
        <a href="/yellow-books" className="text-sm underline">
          &larr; буцах
        </a>

        <h1 className="text-2xl font-bold mt-2">{item.name}</h1>
        <p className="text-xs uppercase tracking-wide text-gray-500">{item.category}</p>

        <section aria-labelledby="address" className="mt-4">
          <h2 id="address" className="font-semibold">
            Хаяг
          </h2>
          <p className="text-sm text-gray-700">
            {item.address.district}, {item.address.street}
            {item.address.building ? `, ${item.address.building}` : ''}
          </p>
        </section>

        <section aria-labelledby="contacts" className="mt-4">
          <h2 id="contacts" className="font-semibold">
            Холбогдох
          </h2>
          <ul className="text-sm text-gray-700 list-disc pl-5">
            {item.contacts?.phone && <li>Утас: {item.contacts.phone}</li>}
            {item.contacts?.email && <li>И-мэйл: {item.contacts.email}</li>}
            {item.contacts?.website && (
              <li>
                Вэб:{' '}
                <a className="underline" href={item.contacts.website} target="_blank">
                  Website
                </a>
              </li>
            )}
            {item.contacts?.facebook && (
              <li>
                FB:{' '}
                <a className="underline" href={item.contacts.facebook} target="_blank">
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="desc" className="mt-4">
          <h2 id="desc" className="font-semibold">
            Тайлбар
          </h2>
          <p className="text-sm text-gray-700">{item.description ?? '—'}</p>
        </section>

        {/* Map */}
        {/* <section aria-labelledby="map" className="mt-6">
          <h2 id="map" className="font-semibold">
            Байршил (Map)
          </h2>
          <div className="rounded-2xl overflow-hidden border">
            <iframe
              title="Map"
              width="100%"
              height="320"
              src={osmSrc}
              aria-label="Business location on map"
            />
          </div>
        </section> */}

        {/* Photos */}
        {item.photos && item.photos.length > 0 && (
          <section aria-labelledby="photos" className="mt-6">
            <h2 id="photos" className="font-semibold">
              Зургууд
            </h2>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {item.photos.map((photoUrl, index) => (
                <div
                  key={photoUrl ?? `photo-${index}`}
                  className="relative h-40 w-full overflow-hidden rounded-xl"
                >
                  <Image
                    src={photoUrl ?? fallbackPhoto}
                    alt={`${item.name} ${index + 1}`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    );
  } catch {
    notFound();
  }
}

// generateStaticParams нь detail page -үүдийг prebuild хийгээд list -ийг cache хийнэ
export async function generateStaticParams() {
  try {
    const list = await fetchYellowBooks({
      cache: 'force-cache',
      tags: [YELLOW_BOOKS_TAG],
    });

    return list.map((item) => ({ slug: item.slug }));
  } catch (error) {
    console.warn('yellow-books generateStaticParams fallback:', error);
    return [];
  }
}
