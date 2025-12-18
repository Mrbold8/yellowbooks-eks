// tools/embed-businesses.ts
import { Prisma, PrismaClient } from '@prisma/client';

import { getEmbedding } from './embed-client';

const prisma = new PrismaClient();

// Batch бүрт process хийх мөр 
const BATCH_SIZE = 20;

// Embedding хийх input -ээ бэлдэнэ
function buildEmbeddingInput(business: any): string {
  const parts: string[] = [];

  if (business.name) {
    parts.push(`Name: ${business.name}`);
  }

  const locationPieces: string[] = [];
  if (business.city) locationPieces.push(business.city);
  if (business.district) locationPieces.push(business.district);
  if (locationPieces.length > 0) {
    parts.push(`Location: ${locationPieces.join(', ')}`);
  }

  // category
  if (Array.isArray(business.categories) && business.categories.length > 0) {
    parts.push(`Categories: ${business.categories.join(', ')}`);
  } else if (business.category) {
    parts.push(`Category: ${business.category}`);
  }

  if (business.description) {
    parts.push(`Description: ${business.description}`);
  }

  if (parts.length === 0) {
    parts.push(JSON.stringify(business));
  }

  return parts.join('\n');
}

async function main() {
  console.log('Business -үүдийн embedding үүсгэх...');

  let processedTotal = 0;

  // embedding = null мөр байхгүй болтол давтана
  while (true) {
    const businesses = await prisma.yellowBook.findMany({
      where: { embedding: { equals: Prisma.DbNull } },
      take: BATCH_SIZE,
      orderBy: { id: 'asc' },
    });

    if (businesses.length === 0) {
      console.log('Embeddings done.');
      break;
    }

    console.log(`Embeddings -гүй бизнесүүд: ${businesses.length}`);

    for (const business of businesses) {
      const input = buildEmbeddingInput(business);

      try {
        console.log(`Embedding business id=${business.id}, name="${business.name}"...`);

        const vector = await getEmbedding(input);

        // Business бүрийн embedding -> DB -д оруулна.
        await prisma.yellowBook.update({
          where: { id: business.id },
          data: {
            embedding: vector as any,
          },
        });

        processedTotal += 1;
      } catch (err) {
        console.error(
          `Business id=${business.id}, name="${business.name}" embed хийхэд алдаа гарлаа.`,
          err,
        );
      }
    }

    console.log(`Processed: ${processedTotal} businesses.\n`);
  }

  console.log('Embedding хийж дууссан.');
}


main()
  .catch((err) => {
    console.error('embed-businesses script ажилуулахад алдаа гарлаа:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
