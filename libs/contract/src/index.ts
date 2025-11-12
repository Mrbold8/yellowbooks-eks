export * from './lib/contract';
import { z } from 'zod';

/** ───────────────────
 *  Basic building blocks
 *  ─────────────────── */
export const CategoryEnum = z.enum([
  'restaurant',
  'cafe',
  'shop',
  'hotel',
  'service',
  'bank',
  'atm',
  'pharmacy',
  'gym',
  'education',
  'entertainment',
  'government',
  'other',
]);
export type Category = z.infer<typeof CategoryEnum>;

export const PriceLevelEnum = z.enum(['FREE', 'CHEAP', 'MODERATE', 'EXPENSIVE', 'LUXURY']);
export type PriceLevel = z.infer<typeof PriceLevelEnum>;

export const GeoSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});
export type Geo = z.infer<typeof GeoSchema>;

export const AddressSchema = z.object({
  city: z.string().min(1).default('Ulaanbaatar'),
  district: z.string().min(1), // e.g., Sukhbaatar, Bayangol …
  street: z.string().min(1),
  building: z.string().optional(),
  postalCode: z.string().optional(),
});
export type Address = z.infer<typeof AddressSchema>;

const UrlSchema = z.string().url();
const PhoneSchema = z
  .string()
  .regex(/^[0-9+\-\s()]{5,20}$/, 'Invalid phone')
  .optional();

export const ContactSchema = z.object({
  phone: PhoneSchema,
  email: z.string().email().optional(),
  website: UrlSchema.optional(),
  facebook: UrlSchema.optional(),
});
export type Contact = z.infer<typeof ContactSchema>;

const DayEnum = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
export type Day = z.infer<typeof DayEnum>;

export const BusinessHourSchema = z
  .object({
    day: DayEnum,
    open: z.string().regex(/^\d{2}:\d{2}$/, 'HH:mm'),
    close: z.string().regex(/^\d{2}:\d{2}$/, 'HH:mm'),
  })
  .refine(
    (v) => v.open < v.close, // simple lexical (00:00..23:59), good enough for now
    { message: 'open must be before close', path: ['open'] },
  );
export type BusinessHour = z.infer<typeof BusinessHourSchema>;

/** ───────────────────
 *  YellowBook entry
 *  ─────────────────── */
export const YellowBookEntrySchema = z
  .object({
    id: z.union([z.string().min(1), z.number().int().nonnegative()]).transform(String),
    slug: z.string().min(1), // unique string for routing
    name: z.string().min(1),
    description: z.string().max(2000).optional(),

    category: CategoryEnum,

    address: AddressSchema,
    location: GeoSchema,

    contacts: ContactSchema.optional(),
    hours: z.array(BusinessHourSchema).min(1).max(7).optional(),

    photos: z.array(UrlSchema).max(10).optional(),

    rating: z.coerce.number().min(0).max(5).optional(),
    reviewCount: z.coerce.number().int().min(0).default(0),

    priceLevel: PriceLevelEnum.optional(),

    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
export type YellowBookEntry = z.infer<typeof YellowBookEntrySchema>;

export const YellowBookListSchema = z.array(YellowBookEntrySchema);
export type YellowBookList = z.infer<typeof YellowBookListSchema>;

/** Helpers for API/web */
export function assertYellowBookList(data: unknown): YellowBookList {
  const parsed = YellowBookListSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`YellowBookList validation failed: ${issues}`);
  }
  return parsed.data;
}
