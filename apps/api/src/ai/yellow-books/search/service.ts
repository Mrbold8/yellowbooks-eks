// apps/api/src/ai/yellow-books/search/service.ts
import { Prisma } from '@prisma/client';

import { AIClientError, embedQuestion, generateAnswer } from '../../ai-client';
import { getPrismaClient } from '../../../db';

type YellowBookRow = Prisma.YellowBookGetPayload<object>;

export type YellowBookBusiness = {
  id: string;
  slug: string;
  name: string;
  city?: string | null;
  district?: string | null;
  category?: string | null;
  description?: string | null;
};

type SearchResult = {
  answer: string;
  businesses: YellowBookBusiness[];
};

// 2 векторын cosine similarity тооцоолно.
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) {
    return -1;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }

  if (normA === 0 || normB === 0) {
    return -1;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// text generatin model -д дамжуулах prompt -оо бэлдэнэ.
function buildPrompt(question: string, businesses: YellowBookBusiness[]): string {
  const businessDescriptions = businesses
    .map((b, index) => {
      const locationParts: string[] = [];
      if (b.city) locationParts.push(b.city);
      if (b.district) locationParts.push(b.district);

      return [
        `#${index + 1}: ${b.name}`,
        locationParts.length ? `Location: ${locationParts.join(', ')}` : '',
        b.category ? `Category: ${b.category}` : '',
        b.description ? `Description: ${b.description}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  return [
    'You are the AI assistant for YellowBooks, a Mongolian local business directory.',
    "Your task is to answer the user's question in Mongolian, using only the businesses provided below.",
    '',
    'User question (Mongolian):',
    `"""`,
    question,
    `"""`,
    '',
    'Candidate businesses:',
    businessDescriptions || '(no businesses found)',
    '',
    'Requirements for your answer:',
    '- Always answer in natural, friendly Mongolian.',
    '- Suggest 2–3 suitable businesses if possible; mention their names clearly.',
    '- Explain briefly why each suggested business is relevant.',
    '- If there are no clearly relevant businesses, honestly say that you could not find suitable matches and maybe suggest general alternatives.',
  ].join('\n');
}

const CATEGORY_HINTS: Array<{ category: string; tokens: string[] }> = [
  { category: 'cafe', tokens: ['coffee', 'кофе', 'кафе', 'espresso', 'кофе шоп', 'coffee shop'] },
  { category: 'restaurant', tokens: ['restaurant', 'ресторан', 'хоол', 'хоолны газар', 'diner'] },
  { category: 'gym', tokens: ['gym', 'фитнес', 'биеийн тамир'] },
  { category: 'pharmacy', tokens: ['эмийн сан', 'pharmacy', 'эм'] },
  { category: 'hotel', tokens: ['hotel', 'зочид буудал'] },
];

function normalize(text: string | null | undefined): string {
  return text?.toLowerCase() ?? '';
}

function detectPreferredCategories(questionLower: string): Set<string> {
  const matches = CATEGORY_HINTS.filter((hint) =>
    hint.tokens.some((token) => questionLower.includes(token)),
  ).map((hint) => hint.category);

  return new Set(matches);
}

function extractQuestionTokens(questionLower: string): string[] {
  return questionLower
    .split(/[^a-z\u0400-\u04FF0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function businessFromRow(row: YellowBookRow): YellowBookBusiness {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city ?? null,
    district: row.district ?? null,
    category: row.category ?? null,
    description: row.description ?? null,
  };
}

function computeFallbackScore(
  row: YellowBookRow,
  questionLower: string,
  preferredCategories: Set<string>,
  tokens: string[],
): number {
  let score = 0;
  const rowCategory = normalize(row.category);

  if (preferredCategories.size === 0) {
    score += 1;
  } else if (preferredCategories.has(rowCategory)) {
    score += 4;
  }

  const district = normalize(row.district);
  if (district && questionLower.includes(district)) {
    score += 2;
  }

  const city = normalize(row.city);
  if (city && questionLower.includes(city)) {
    score += 1;
  }

  const description = normalize(row.description);
  const name = normalize(row.name);

  for (const token of tokens) {
    if (name.includes(token)) score += 1;
    if (description.includes(token)) score += 1;
  }

  return score;
}

function selectFallbackBusinesses(rows: YellowBookRow[], question: string): YellowBookBusiness[] {
  if (rows.length === 0) {
    return [];
  }

  const questionLower = question.toLowerCase();
  const preferredCategories = detectPreferredCategories(questionLower);
  const tokens = extractQuestionTokens(questionLower);

  const scored = rows.map((row) => ({
    business: businessFromRow(row),
    score: computeFallbackScore(row, questionLower, preferredCategories, tokens),
  }));

  scored.sort((a, b) => b.score - a.score);

  const maxScore = scored[0]?.score ?? 0;
  if (maxScore === 0) {
    return scored.slice(0, 3).map((entry) => entry.business);
  }

  return scored.slice(0, 3).map((entry) => entry.business);
}

function buildFallbackAnswer(question: string, businesses: YellowBookBusiness[]): string {
  if (businesses.length === 0) {
    return `Уучлаарай, "${question}" асуултад тохирох бизнес олдсонгүй. Дахин тодруулж асуугаарай эсвэл өөр төрөл хайж үзээрэй.`;
  }

  const bulletList = businesses
    .map((b) => {
      const location = [b.district, b.city].filter(Boolean).join(', ');
      return `- ${b.name}${location ? ` (${location})` : ''}`;
    })
    .join('\n');

  return [
    `Таны "${question}" асуултад дараах газрууд тохирч байна:`,
    bulletList,
    'Дэлгэрэнгүй мэдээллийг YellowBook -ийн дэлгэрэнгүй хуудсаас шалгаарай.',
  ].join('\n');
}

/*
  Гол search функц:
  1) Асуултыг Embed хийнэ.
  2) Embedding -тэй business -үүдийг ачааллана
  3) Cosine similarity -г тооцоолоод, top matches -ийг сонгож авна.
  4) text gen model ашиглаад хариу үүсгэнэ.
*/
export async function searchYellowBooks(question: string, city?: string): Promise<SearchResult> {
  const prisma = getPrismaClient();
  let questionEmbedding: number[] | null = null;
  try {
    questionEmbedding = await embedQuestion(question);
  } catch (err) {
    if (err instanceof AIClientError && err.code === 'missing-api-key') {
      console.warn('[yellowbook-ai] Hugging Face API key тохируулаагүй байна!');
    } else {
      console.warn('[yellowbook-ai] Асуултыг embed хийхэд алдаа гарлаа.', err);
    }
  }

  const baseWhere: Prisma.YellowBookWhereInput = {};
  if (city) {
    baseWhere.city = city;
  }

  const where: Prisma.YellowBookWhereInput = questionEmbedding
    ? { ...baseWhere, embedding: { not: Prisma.DbNull } }
    : baseWhere;

  const rows = await prisma.yellowBook.findMany({ where });

  const withScores: {
    business: YellowBookBusiness;
    score: number;
  }[] = [];

  if (questionEmbedding) {
    for (const row of rows) {
      const businessEmbedding = row.embedding as unknown as number[] | null;
      if (!businessEmbedding) continue;

      const score = cosineSimilarity(questionEmbedding, businessEmbedding);
      if (score < 0) continue;

      withScores.push({ business: businessFromRow(row), score });
    }
  }

  let topBusinesses: YellowBookBusiness[] = [];

  if (withScores.length > 0) {
    withScores.sort((a, b) => b.score - a.score);
    topBusinesses = withScores.slice(0, 3).map((entry) => entry.business);
  } else {
    topBusinesses = selectFallbackBusinesses(rows, question);

    if (topBusinesses.length === 0) {
      const fallbackRows = await prisma.yellowBook.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take: 3,
      });
      topBusinesses = selectFallbackBusinesses(fallbackRows, question);
    }
  }

  let answer = '';
  if (topBusinesses.length === 0) {
    answer = buildFallbackAnswer(question, topBusinesses);
  } else {
    try {
      const prompt = buildPrompt(question, topBusinesses);
      answer = await generateAnswer(prompt);
    } catch (err) {
      if (err instanceof AIClientError && err.code === 'missing-api-key') {
        console.warn('[yellowbook-ai] Hugging Face API key тохируулаагүй байна!');
      } else {
        console.warn('[yellowbook-ai] Хариу generate хийхэд алдаа гарлаа.', err);
      }
      answer = buildFallbackAnswer(question, topBusinesses);
    }
  }

  return {
    answer,
    businesses: topBusinesses,
  };
}
