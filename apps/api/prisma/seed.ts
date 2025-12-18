import { PrismaClient, Category, PriceLevel } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const listings = [
    {
      slug: 'coffee-house-sbd',
      name: 'Coffee House SBD',
      description: 'Сайн байна уу? Аз жаргалын өргөөнд тавтай морилно уу.',
      category: Category.cafe,
      city: 'Улаанбаатар',
      district: 'Баянзүрх',
      street: 'Tokyo street',
      lat: 47.9186,
      lng: 106.917,
      contacts: {
        phone: '+976 99112233',
        facebook: 'https://facebook.com/coffeehouseub',
      },
      hours: [{ day: 'Mon', open: '09:00', close: '20:00' }],
      photos: [
        'https://scontent.fuln6-1.fna.fbcdn.net/v/t39.30808-6/476079161_1019620753533695_609474720987133100_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=JLlShsleuy4Q7kNvwH1ka0Z&_nc_oc=AdmoBIqaEzrzGgObbSOe6Z1myxifAGWTYPN1Mb0SBLkWPI_6QHzPBj57xLWXTM_oU90kda6iZu9_dQKSxXxPJHeN&_nc_zt=23&_nc_ht=scontent.fuln6-1.fna&_nc_gid=u3X4DwaZs2hrvtVvKPmSzQ&oh=00_Afkvkq9nOkrsnsJUsxqWyr8DZQrMYyiq9k2Yl-hOtkEr1A&oe=6936DFF0',
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
      city: 'Улаанбаатар',
      district: 'Баянгол',
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
      city: 'Улаанбаатар',
      district: 'Чингэлтэй',
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
      city: 'Улаанбаатар',
      district: 'Сонгинохайрхан',
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
      city: 'Улаанбаатар',
      district: 'Хан-Уул',
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
    {
      slug: 'caffe-bene-mongolia',
      name: 'Caffe Bene Mongolia',
      description: 'Каффе Бэнэ олон улсын франчайз кофе шопын сүлжээ.',
      category: Category.cafe,
      city: 'Улаанбаатар',
      district: 'Сүхбаатар',
      street: 'Prime Minister Amar St 15',
      lat: 47.9178,
      lng: 106.9136,
      contacts: {
        phone: '+976 7711 7788',
        facebook: 'https://facebook.com/CaffeBeneMongolia',
      },
      hours: [
        { day: 'Mon', open: '08:00', close: '23:00' },
        { day: 'Sun', open: '09:00', close: '23:00' },
      ],
      photos: [
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
      ],
      rating: 4.5,
      reviewCount: 210,
      priceLevel: PriceLevel.MODERATE,
    },
    {
      slug: 'roc-mongolia',
      name: 'Roc Mongolia',
      description: 'The recently renovated ROC Drink Bar branch adds a new color to the coffee bars of Mongolia and serves special drinks tailored for both day and night.',
      category: Category.cafe,
      city: 'Улаанбаатар',
      district: 'Сүхбаатар',
      street: '40th Myangat',
      lat: 47.9225,
      lng: 106.9071,
      contacts: {
        phone: '+976 8810 0099',
        instagram: 'https://instagram.com/rocmongolia',
      },
      hours: [{ day: 'Fri', open: '09:00', close: '21:00' }],
      photos: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      ],
      rating: 4.6,
      reviewCount: 132,
      priceLevel: PriceLevel.MODERATE,
    },
    {
      slug: 'ubean-coffee',
      name: 'UBean Coffee House',
      description: 'The Best Little Coffee Bar In Ulaanbataar',
      category: Category.cafe,
      city: 'Улаанбаатар',
      district: 'Баянзүрх',
      street: '40th Myangat',
      lat: 27.9225,
      lng: 106.9071,
      contacts: {
        phone: '+976 8810 0099',
        instagram: 'https://instagram.com',
      },
      hours: [{ day: 'Fri', open: '09:00', close: '21:00' }],
      photos: [
        'https://texascoffeeschool.com/wp-content/uploads/2021/10/DSC_0052-scaled.jpg',
      ],
      rating: 4.6,
      reviewCount: 132,
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
