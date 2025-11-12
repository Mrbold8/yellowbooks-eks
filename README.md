# YellowBook (Nx Monorepo)

Улаанбаатарын бизнесийн лавлах — **Next.js (App Router)** frontend + **Express API** + **shared Zod contract**, **Nx** болон **pnpm** -р удирдана.

> Rubric coverage / Шалгуур хангасан зүйлс
>
> - ESLint (Flat Config, ESLint 9) + Prettier + **TypeScript `--noEmit`**
> - Nx **affected** CI (GitHub Actions)
> - **Shared contract** (Zod) API ба Web -д хоёуланд нь ашиглагдана
> - Prisma model, migration, **≥5 seed**
> - API `GET /yellow-books` ба Next.js дээр render

---

## Tech & Versions / Хэрэглэсэн технологи, хувилбар

- Node **20.x**
- pnpm **10.x**
- Nx **21.x**
- TypeScript **5.x**
- ESLint **9.x** (Flat Config)
- Next.js **15 (App Router)**
- Prisma **5.x**
- PostgreSQL **14+**

---

## Monorepo Layout / Төслийн бүтэц

```
apps/
  web/            # Next.js 15 (App Router), Tailwind, API -с fetch
  api/            # Express API (CORS, Zod баталгаажуулалт)
    prisma/
      schema.prisma
      seed.ts
libs/
  contract/       # Zod схем, төрөл (YellowBookEntrySchema)
  config/         # Нийтлэг тохиргоо, env туслахууд
.github/
  workflows/ci.yml
eslint.config.mjs
eslint.base.mjs
tsconfig.base.json
```

---

## Quick Start (Local)

1. **Dependencies суулгах**

```bash
pnpm install
```

2. **(First time) Approve builds / Эхний удаа build зөвшөөрөх (pnpm v10)**

```bash
pnpm approve-builds
# 'a' дарж бүгдийг сонгоод Enter дарна
```

3. **Generate Prisma Client / Prisma client үүсгэх**

```bash
pnpm exec prisma generate
```

> Prisma schema нь **`apps/api/prisma/schema.prisma`** path -д байрлана (package.json -д заасан).

4. **Create `.env` / Орчны хувьсагч**

```bash
cp .env.example .env
```

5. **Run Postgres (Docker жишээ) / Postgres ажиллуулах**

```bash
docker run --name yellowbook-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

6. **Migrate & Seed**

```bash
pnpm exec prisma migrate dev
pnpm exec ts-node apps/api/prisma/seed.ts
```

7. **Start API & Web (2 терминал) / API ба Web ажиллуулах**

```bash
pnpm nx serve api
pnpm nx serve web
```

- API: http://localhost:4000 ( `API_PORT`-оор тохиргоотой )
- Web: http://localhost:3000

---

## Environment / Орчны тохиргоо

**`.env.example`** (copy to `.env`):

```dotenv
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yellowbook?schema=public"

# API
API_PORT=4000
```

---

## Shared Contract (Zod)

- **`libs/contract`** дотор `YellowBookEntrySchema` болон түүнээс **inferred** төрөл гарна.
- **API**: буцаахын өмнө `assertYellowBookList(list)` ашиглан **runtime** баталгаажуулна. (validates runtime responses with Zod)
- **Web**: imports the inferred types from the same schema to ensure compile-time safety.

**Шаардлагатай талбарууд / Required fields:**

- `id`, `slug`, `name`, `category`
- `address` `{ city, district, street, building?, postalCode? }`
- `location` `{ lat, lng }`
- `contacts?`, `hours?`, `photos?`
- `rating?`, `reviewCount`, `priceLevel?`
- `createdAt`, `updatedAt`

---

## Prisma Model / Prisma загвар

- Зам: **`apps/api/prisma/schema.prisma`**
- Contracts -тай таарах талбарууд, enum-ууд (`Category`, `PriceLevel`) орсон.
- Seed: **`apps/api/prisma/seed.ts`** — **≥5 бодит** жишээ listings.

> Schema өөрчилбөл:

```bash
pnpm exec prisma migrate dev -n "<msg>"
pnpm exec prisma generate
```

---

## API

Base URL (local): `http://localhost:4000`

### `GET /health`

- **EN:** Simple health check `{ ok: true }`
- **MN:** Сервис ажиллаж байгаа эсэхийг шалгана.

### `GET /yellow-books`

- **EN:** Returns Zod-validated `YellowBookEntry[]`, `Cache-Control: no-store`
- **MN:** Zod -оор баталгаажсан жагсаалт буцаана, no-cache.

### `GET /yellow-books/:slug`

- **EN:** Single entry by slug (404 if not found), same row→contract mapper
- **MN:** Slug-аар нэг entry буцаана, олдохгүй бол 404.

**Security / Аюулгүй байдал**

- CORS (`origin: true`)
- Error handling: 400/404/500

---

## Web (Next.js App Router)

- **`/yellow-books`** — API -аас fetch хийж жагсаалт рендэрлэнэ (no hardcoded data)
- **`/yellow-books/[slug]`** — дэлгэрэнгүй, жижиг **map island** үзүүлнэ

---

## Lint, Format, Typecheck

```bash
# ESLint (Flat Config, ESLint 9) — бүх project -д
pnpm nx run-many -t lint

# Prettier — шалгах (no write)
pnpm format:check

# TypeScript — no-emit глобал шалгалт
pnpm typecheck
```

**Notes / Тэмдэглэл**

- ESLint үндсэн тохиргоо (config): **`eslint.base.mjs`**, project тус бүрт `eslint.config.mjs` энэ файлыг импортоор ашиглана.
- React/Next дүрмүүд зөвхөн `apps/web/**`-д үйлчилнэ.
- Node config файлууд танигдана (`next.config.js`, `tailwind.config.js`, …).
- Ашиглагдаагүй хувьсагч/параметр `_`-оор эхэлбэл зөрчил үүсгэхгүй (DX).

---

## CI (GitHub Actions)

Файл: **`.github/workflows/ci.yml`**

Runs on PRs & pushes:

- **Nx affected lint** (PR), **run-many lint** (push)
- **Prettier check**
- **TypeScript `--noEmit`**
- **Prisma generate** (monoreпо schema, DB шаардлагагүй)

Caching:

- `pnpm/action-setup@v4` + `actions/setup-node@v4 (cache: pnpm)`

---

## Design Choices / Шийдлийн тайлбар

- **Single Source of Truth (Zod)** — гэрээ `libs/contract`-д байрлана → API/Web зөрөхөөс сэргийлнэ.
- **Runtime Validation** — API validates responses with Zod; web trusts the contract types.
- **Nx for Scale** — clear boundaries, fast affected commands, CI integration.
- **App Router** — simpler data islands, server-first rendering.
- **Prisma** — ойлгомжтой schema, strong TS types, ergonomic seeding.
- **A11y & Performance** — Next-ийн сануулгуудыг warning болгон CI -г таслахгүйгээр сайжруулах чиглэл өгдөг.

---

## Troubleshooting / Асуудал шийдэх

**ESLint v9: “couldn’t find eslint.config”**  
— Root-д **`eslint.config.mjs`** байгаа эсэх, проект бүр `../../eslint.base.mjs`-г импортолж буй эсэхийг шалгах.

**“Could not find plugin import”**  
— `eslint-plugin-import@^2` devDep суусан эсэх; `pnpm install` дахин хийнэ.

**Next: “Pages directory cannot be found”**  
— Энэ төсөл **App Router** ашигладаг. `@next/next/no-html-link-for-pages` rule -г disable хийсэн.

**pnpm v10 approve-builds**  
— Локал дээр **`pnpm approve-builds`** нэг удаа гүйцэтгэнэ (CI -д шаардлагагүй -> Prisma generate runs explicitly).

**Prisma Client types/enums not found**  
— **`pnpm exec prisma generate`** заавал ажиллуул; schema зам нь **`apps/api/prisma/schema.prisma`**.

**TypeScript JSX error**  
— `tsconfig.base.json`-д `"jsx": "react-jsx"` тохируулсан, test/spec -үүдийг **exclude**-д нэмсэн.

---

## Scripts / Скриптүүд

```jsonc
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc -p tsconfig.base.json --noEmit",
    "gen:prisma": "prisma generate",
  },
  "prisma": {
    "schema": "apps/api/prisma/schema.prisma",
  },
}
```
