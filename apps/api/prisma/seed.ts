import { PrismaClient, Category, PriceLevel } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const listings = [
    {
      slug: 'coffee-house-sbd',
      name: 'Coffee House SBD',
      description: 'Specialty coffee in Sukhbaatar district. туршилт - revalidation ',
      category: Category.cafe,
      city: 'Ulaanbaatar',
      district: 'Sukhbaatar',
      street: 'Seoul St 12',
      lat: 47.9186,
      lng: 106.917,
      contacts: {
        phone: '+976 99112233',
        facebook: 'https://facebook.com/coffeehouseub',
      },
      hours: [{ day: 'Mon', open: '09:00', close: '20:00' }],
      photos: ['https://example.com/ub-coffee-1.jpg'],
      rating: 4.6,
      reviewCount: 128,
      priceLevel: PriceLevel.MODERATE,
    },
    {
      slug: 'khankhorum-hotel',
      name: 'Khankhorum Hotel',
      description: 'Comfortable rooms near city center.',
      category: Category.hotel,
      city: 'Ulaanbaatar',
      district: 'Bayangol',
      street: 'Peace Ave 45',
      lat: 47.9132,
      lng: 106.8821,
      contacts: { phone: '+976 88112233', website: 'https://khankhorum.example.com' },
      hours: [{ day: 'Mon', open: '00:00', close: '23:59' }],
      photos: ['https://example.com/hotel-1.jpg'],
      rating: 4.2,
      reviewCount: 86,
      priceLevel: PriceLevel.EXPENSIVE,
    },
    {
      slug: 'nomads-kitchen',
      name: 'Nomads Kitchen',
      description: 'Modern Mongolian fusion restaurant.',
      category: Category.restaurant,
      city: 'Ulaanbaatar',
      district: 'Chingeltei',
      street: 'Barilgachdyn Talbai 3',
      lat: 47.9249,
      lng: 106.9082,
      contacts: { phone: '+976 77112233' },
      hours: [{ day: 'Fri', open: '11:00', close: '22:00' }],
      photos: ['https://example.com/nomads-1.jpg'],
      rating: 4.8,
      reviewCount: 230,
      priceLevel: PriceLevel.MODERATE,
    },
    {
      slug: 'city-pharmacy-1',
      name: 'City Pharmacy #1',
      description: '24/7 pharmacy service.',
      category: Category.pharmacy,
      city: 'Ulaanbaatar',
      district: 'Songinokhairkhan',
      street: 'Khoroo 1, 5th khoroolol',
      lat: 47.938,
      lng: 106.822,
      contacts: { phone: '+976 99001122' },
      hours: [{ day: 'Mon', open: '00:00', close: '23:59' }],
      photos: [],
      rating: 4.1,
      reviewCount: 54,
      priceLevel: PriceLevel.CHEAP,
    },
    {
      slug: 'fitzone-gym',
      name: 'FitZone Gym',
      description: 'Weights, cardio, group classes.',
      category: Category.gym,
      city: 'Ulaanbaatar',
      district: 'Bayanzurkh',
      street: 'Narnii Road 21',
      lat: 47.921,
      lng: 106.953,
      contacts: { phone: '+976 88007766', facebook: 'https://facebook.com/fitzoneub' },
      hours: [{ day: 'Sat', open: '08:00', close: '22:00' }],
      photos: [
        'https://thumbs.dreamstime.com/b/cute-cat-practicing-weightlifting-gym-muscular-flexes-body-building-healthy-lifestyle-movement-activity-action-concept-354795593.jpg',
      ],
      rating: 4.3,
      reviewCount: 97,
      priceLevel: PriceLevel.MODERATE,
    },
  ];

  for (const l of listings) {
    await prisma.yellowBook.upsert({
      where: { slug: l.slug },
      update: l,
      create: l,
    });
  }
}

main()
  .then(() => console.log('Seeded'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
