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
      photos: [
        'https://scontent.fuln6-1.fna.fbcdn.net/v/t39.30808-6/476079161_1019620753533695_609474720987133100_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=3k7s9HgEzk4Q7kNvwFPjjU0&_nc_oc=Adm_yllhNdfdoNdpoonclbYge8jozkBOADot-dsRQo1hjzpGuG37cQi_TBoeBD2h-sMvLG-SW9uufsjYcCVaaHrq&_nc_zt=23&_nc_ht=scontent.fuln6-1.fna&_nc_gid=PIWdaJ-maOvgK2eMoPnKkw&oh=00_Afj6Cj4UrsjXSbJcqlVNKjHONgfXYMs2mzow-8Csqf6WiA&oe=692C53F0',
      ],
      rating: 4.6,
      reviewCount: 128,
      priceLevel: PriceLevel.MODERATE,
    },
    {
      slug: 'bayangol-hotel',
      name: 'Bayangol Hotel',
      description: 'Comfortable rooms near city center.',
      category: Category.hotel,
      city: 'Ulaanbaatar',
      district: 'Bayangol',
      street: 'Chinggis Avenue-5',
      lat: 47.9132,
      lng: 106.8821,
      contacts: { phone: '(+976)-11-312255', website: 'https://bayangolhotel.mn' },
      hours: [{ day: 'Mon', open: '00:00', close: '23:59' }],
      photos: [
        'https://cf.bstatic.com/xdata/images/hotel/max1024x768/626442863.jpg?k=083e0cb1e06350fd12aff8a4b96324521d4681311610348735a00a36ceb8e96c&o=',
      ],
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
      photos: [
        'https://cdn5.shoppy.mn/img/275954/375x0xwebp/Untitled-4.png?h=246cd2539ee2b75a8c4a155cd70b8f9da4ca71d5',
      ],
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
      photos: [
        'https://scontent.fuln6-2.fna.fbcdn.net/v/t39.30808-6/526764675_1166311015534528_5321408033367040221_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=QGG8dizBRi8Q7kNvwFVmUAB&_nc_oc=Admi4-Gk5Q6Zove1ib6yFkQUaw-QokluRdAJvcVxCbd_p9VpEwuO0nmDY5lfIpPyxAgyPaojM-xORE3j-G-tjeth&_nc_zt=23&_nc_ht=scontent.fuln6-2.fna&_nc_gid=JeoNCDGJ480l4ATAkorL8A&oh=00_AfjdwMvzZbCaftFCpFm9O7CHuXTuJjp1TCd6rIuG1CCVEg&oe=692C44A5',
      ],
      rating: 4.1,
      reviewCount: 54,
      priceLevel: PriceLevel.CHEAP,
    },
    {
      slug: '976-crossfit',
      name: '976 CrossFit',
      description: 'First affiliated CrossFit club in Mongolia',
      category: Category.gym,
      city: 'Ulaanbaatar',
      district: 'Khan-Uul',
      street: '1st floor, CEO Office, Buti Town, 15th Khoroo',
      lat: 47.92,
      lng: 106.923,
      contacts: { phone: '+976 9906 7686', facebook: 'https://facebook.com/976CrossFit' },
      hours: [{ day: 'Sat', open: '08:00', close: '22:00' }],
      photos: [
        'https://mblogthumb-phinf.pstatic.net/MjAyNDA5MTBfNTQg/MDAxNzI1OTc0MzI4Mjkx.PWO7JmNz-CU-gTbFJyP0SDDQKWQCMWjZ-a_UETfuLswg.otfvq6eBTqr3reA-bIofAE30HmLnEHAB0o6Gx91cymAg.JPEG/1725970008749.jpg?type=w800',
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

  // Seed admin user
  const adminEmail = 'mrboldnest@gmail.com';
  // const userEmail = "mrfx0227@gmail.com";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin',
    },
    create: {
      email: adminEmail,
      name: 'YB Admin',
      role: 'admin',
    },
  });
}

main()
  .then(() => console.log('Seeded'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
