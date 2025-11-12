# Гүйцэтгэл

## Хийсэн өөрчлөлтүүд

- `/yellow-books` route -ийг ISR (`revalidate = 60`) болгож, Suspense fallback ашигласнаар page -ийг ачааллах үед skeleton эхэлж үүснэ. TTFB 168 ms орчим, LCP 1,007 ms болсон.
- `/yellow-books/[slug]` detail page -ийг `generateStaticParams` -аар SSG болгож, on-demand revalidation хэрэгжүүлсэн. TTFB 389 ms орчим, LCP 753 ms болсон.
- `/yellow-books/search` route SSR -аар ажиллана. Хүсэлт, query болгонд page -ийг шинээр render хийнэ. LCP 440 ms орчим, TTFB 168 ms болсон.
- `/api/revalidate-yellow-books` -> on-demand revalidation route үүсгэсэн бөгөөд `revalidateTag('yellow-books')` болон `revalidatePath(...)` -ийг хэрэгжүүлсэн.

## Өөрчлөлтүүдийн үр дүнд

- ISR нь cached HTML -ийг хурдан хүргэнэ, 60 сек тутмын revalidate нь мэдээлэл шинэ байх боломжийг олгож байгаа.
- SSG + on-demand revalidation нь detail page -үүдийг prebuild үеэр бэлдэж, өөрчлөлт болгоны дараа шинэ slug болон list -ийг шинэчлэх боломжийг олгоно.
- SSR нь query, хүсэлт бүрт шинэ HTML page үүсгэж буцаана. Client map island нь тодорхой хэсгийг interactive болгох бөгөөд browser талд ажиллуулна.
- Streamed section (Suspense fallback) нь skeleton -ийг түрүүлж үзүүлснээр хэрэглэгчид “хоосон” frame харуулахгүй. Page -ийг бүхэлд нь render хийхийг хүлээхгүй.

## TTFB & LCP хэмжилт (Chrome DevTools, Fast 4G throttle)

| Route                  | TTFB           | LCP     |
| ---------------------- | -------------- | ------- |
| `/yellow-books`        | ~168 ms        | ~1.01 s |
| `/yellow-books/[slug]` | ~170 ms (warm) | ~753 ms |
| `/yellow-books/search` | ~168 ms        | ~440 ms |

> TTFB -ийг Network -> Timing tab -аас, LCP -ийг Performance -> Summary -гийн LCP -ээс авсан.
