// apps/api/src/ai/ai-client.ts
import { InferenceClient } from '@huggingface/inference';

type AIClientErrorCode = 'missing-api-key' | 'inference-error';

export class AIClientError extends Error {
  code: AIClientErrorCode;

  constructor(message: string, code: AIClientErrorCode, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AIClientError';
    this.code = code;
  }
}

const apiKey =
  process.env.HUGGINGFACE_API_KEY ||
  process.env.HUGGINGFACEHUB_API_TOKEN ||
  process.env.HF_TOKEN ||
  process.env.HF_API_KEY;

if (!apiKey) {
  console.warn(
    '[yellowbook-ai] HUGGINGFACE_API_KEY is not configured. Falling back to non-AI search/answers.',
  );
}

const generationEndpointUrl =
  process.env.HUGGINGFACE_GENERATION_ENDPOINT_URL ||
  process.env.HUGGINGFACE_ENDPOINT_URL ||
  process.env.HF_ENDPOINT_URL;

const hfRouter = apiKey ? new InferenceClient(apiKey) : null;

const hfGeneration =
  apiKey && generationEndpointUrl
    ? new InferenceClient(apiKey, { endpointUrl: generationEndpointUrl })
    : hfRouter;

// Embedding model
const EMBEDDING_MODEL_ID = 'intfloat/multilingual-e5-small';

// Text generation model
const GENERATION_MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2';

// Output -ийг normalize хийх шаардлагатай
// HF featureExtraction output -> number[]
function toVector(output: unknown): number[] {
  if (!Array.isArray(output)) {
    throw new Error('embedding output: not an array');
  }

  if (output.length === 0) {
    throw new Error('embedding output: empty array');
  }

  // Case 1: number[]
  if (typeof output[0] === 'number') {
    return output as number[];
  }

  // Case 2: number[][]
  if (Array.isArray(output[0])) {
    return (output[0] as number[]).map((v) => Number(v));
  }

  throw new Error('Unsupported embedding output');
}

// Хэрэглэгчийн асуултыг embedding vector болгоно.
export async function embedQuestion(question: string): Promise<number[]> {
  const trimmed = question.trim();

  if (!trimmed) {
    throw new Error('Асуулт хоосон тул embed хийж болохгүй.');
  }

  if (!hfRouter) {
    throw new AIClientError('HF API key тохируулаагүй байна', 'missing-api-key');
  }

  try {
    const output = await hfRouter.featureExtraction({
      model: EMBEDDING_MODEL_ID,
      inputs: trimmed,
    });

    return toVector(output as unknown);
  } catch (err) {
    throw new AIClientError('Асуултыг embed хийхэд алдаа гарлаа.', 'inference-error', {
      cause: err,
    });
  }
}

// Text generation model ашиглаад Монгол хариу үүсгэнэ.
export async function generateAnswer(prompt: string): Promise<string> {
  if (!hfGeneration) {
    throw new AIClientError('Hugging Face API key тохируулаагүй байна.', 'missing-api-key');
  }

  try {
    const result = await hfGeneration.textGeneration({
      model: GENERATION_MODEL_ID,
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.4,
        do_sample: true,
      },
    });

    const text = (result as any).generated_text ?? '';
    return text.trim();
  } catch (err) {
    throw new AIClientError('Хариу generate хийхэд алдаа гарлаа', 'inference-error', {
      cause: err,
    });
  }
}
