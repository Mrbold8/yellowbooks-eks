// apps/web/next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained server bundle
  output: 'standalone',

  // Monorepo file-tracing root (adjust if your repo depth differs)
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Optional: stricter runtime checks
  reactStrictMode: true,
};

export default nextConfig;
