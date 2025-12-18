// tools/embed-client.ts
import { InferenceClient } from '@huggingface/inference';

const apiKey =
  process.env.HUGGINGFACE_API_KEY ||
  process.env.HUGGINGFACEHUB_API_TOKEN ||
  process.env.HF_TOKEN ||
  process.env.HF_API_KEY;

if (!apiKey) {
  throw new Error(
    'Set huggingface creds!',
  );
}

// Бүх хүсэлтэд дахин ашиглах client 
const hf = new InferenceClient(apiKey);

// Multilingual embedding model (Mongolian + English)
const MODEL_ID = 'intfloat/multilingual-e5-small';

// Output -ийг normalize хийх шаардлагатай
function toVector(output: unknown): number[] {
  if (!Array.isArray(output)) {
    throw new Error('Unexpected embedding output: not an array');
  }

  if (output.length === 0) {
    throw new Error('Unexpected embedding output: empty array');
  }

  // Case 1: number[]
  if (typeof output[0] === 'number') {
    return output as number[];
  }

  // Case 2: number[][] хэрэв эхний element нь массив байвал 
  if (Array.isArray(output[0])) {
    return (output[0] as number[]).map((v) => Number(v));
  }

  throw new Error('Unsupported embedding output shape from featureExtraction');
}

// input text -ийг embedding vector болгоно.
export async function getEmbedding(text: string): Promise<number[]> {
  const trimmed = text.trim(); // trim whitespace

  if (!trimmed) {
    throw new Error('Хоосон текст тул embedding үүсгэх боломжгүй.');
  }

  const output = await hf.featureExtraction({
    model: MODEL_ID,
    inputs: trimmed,
  });

  // featureExtraction -> raw floats буцаана (embedding)
  return toVector(output as unknown);
}
