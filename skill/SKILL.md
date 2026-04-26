---
name: nextjs-dal-traveltour
description: >
  Data Access Layer (DAL) patterns and conventions for the TravelTour Next.js project.
  Use this skill whenever writing, editing, or reviewing any data-access code in this project —
  queries, mutations, DTOs, server actions, lib utilities, or anything that touches the database
  or Supabase. Trigger on phrases like "add a query", "create a mutation", "write a server action",
  "new domain", "fetch from db", "update the database", "DAL", or any request to read/write
  tour, booking, review, wishlist, user, or destination data.
---

# TravelTour — Data Access Layer (DAL) Skill

**Project path:** `/home/micahjordan/programming/nextjs/travel-tour`  
**Stack:** Next.js 16 App Router · Supabase (Postgres + Auth) · Prisma ORM · Zod v4 · TypeScript strict

---

## 1. Golden Rule — Dependency Flow

Dependencies only flow **inward**. Never skip a layer.

```
app/  (Server Components, Server Actions)
  ↓
data/queries/*     (reads — no side effects)
data/mutations/*   (writes — always validate + auth)
  ↓
lib/auth.ts        (getSession, requireAuth)
lib/supabase.ts    (client factory)
lib/db.ts          (Prisma singleton)
  ↓
Supabase API / Postgres
```

**Never in `app/`:**
- `import { db } from "@/lib/db"`
- `import { createServerClient } from "@/lib/supabase"`
- Raw SQL or direct Supabase queries
- `import { PrismaClient }` from anywhere

---

## 2. Lib Layer

### lib/db.ts
- Exports `db` — PrismaClient singleton via `globalThis` pattern
- **Only place** PrismaClient is ever instantiated
- Import: `import { db } from "@/lib/db"`
- Prisma output is non-standard: `lib/generated/prisma`

### lib/supabase.ts
- Exports: `createServerClient()`, `createBrowserClient()`, `createServiceClient()`
- `createServerClient()` → Server Components, Server Actions, API routes
- `createBrowserClient()` → Client Components only
- Import: `import { createServerClient } from "@/lib/supabase"`
- Do NOT import from `lib/supabase/server.ts` directly in `app/`

### lib/auth.ts
- Exports: `getSession()`, `requireAuth()`, `AuthError`, `SessionUser`
- `getSession()` → `SessionUser | null`, never throws
- `requireAuth()` → `SessionUser` or throws `AuthError`
- `SessionUser`: `{ id: string, email: string, role: string }`
- Role from: `app_metadata.role ?? user_metadata.role ?? "customer"`
- Import: `import { requireAuth, getSession } from "@/lib/auth"`

---

## 3. Data Layer Conventions

### Typed Errors — data/errors.ts
Always throw these, never `new Error()`:

| Class | Code | Use when |
|---|---|---|
| `NotFoundError(resource, id?)` | `NOT_FOUND` | Row doesn't exist |
| `ValidationError(message)` | `VALIDATION_ERROR` | Bad input |
| `ForbiddenError(message?)` | `FORBIDDEN` | Wrong ownership/role |
| `AuthError` (from lib/auth.ts) | `UNAUTHORIZED` | Not signed in |

### DTOs — data/dto/*.ts
One file per domain: `users.ts`, `bookings.ts`, `reviews.ts`, `wishlist.ts`

```ts
export const CreateFooSchema = z.object({ ... });
export type CreateFooInput = z.infer<typeof CreateFooSchema>;
```

**Zod v4 gotcha** — use `.error.issues`, NOT `.error.errors`:
```ts
const parsed = Schema.safeParse(input);
if (!parsed.success) {
  throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
}
```

### Queries — data/queries/*.ts
Rules:
1. No side effects, no writes
2. Call `requireAuth()` or `getSession()` at the top if user-scoped
3. Return plain TS objects — never Prisma model instances
4. Convert Decimals: `Number(row.price)`
5. Convert nullables explicitly: `field ?? null`

Domains: `users.ts`, `tours.ts`, `destinations.ts`, `bookings.ts`, `wishlist.ts`

### Mutations — data/mutations/*.ts
Rules:
1. `safeParse` input with DTO schema first → throw `ValidationError` on failure
2. `requireAuth()` at top — always
3. Wrap multi-step writes in `db.$transaction(async (tx) => { ... })`
4. Check ownership: `if (row.user_id !== user.id) throw new ForbiddenError()`
5. Return plain objects, not Prisma types

Domains: `users.ts`, `bookings.ts`, `reviews.ts`, `wishlist.ts`

---

## 4. Prisma Specifics

### Non-standard output path
```prisma
// prisma/schema.prisma
output = "../lib/generated/prisma"
```
Import Prisma types:
```ts
import type { Prisma } from "@/lib/generated/prisma";
type Decimal = Prisma.Decimal;  // ← correct
// NOT: import type { Decimal } from "@/lib/generated/prisma"  ← wrong
```

### Decimal → always convert before returning
```ts
price: Number(row.price)
```

### prisma.config.ts
- Datasource only supports: `url` and `shadowDatabaseUrl`
- `directUrl` is NOT supported here — put it in `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Schema models
| Model | Key fields |
|---|---|
| `bookings` | id, user_id, tour_id, booking_date, number_of_people, total_price(Decimal), status |
| `destinations` | id, name, country, description, image_url |
| `payments` | id, booking_id(unique), payment_method, amount(Decimal), payment_status, payment_date |
| `promotions` | id, code(unique), discount_percentage, expiration_date |
| `reviews` | id, user_id, tour_id, rating, comment, created_at |
| `tour_images` | id, tour_id, image_url |
| `tours` | id, title, description, destination_id, price(Decimal), duration, max_capacity, created_at |
| `users` | id, full_name, email, password_hash, role, phone_number, created_at |
| `wishlist` | composite PK (user_id, tour_id) |

---

## 5. App Layer — Server Actions

Location: `app/(route-group)/(segment)/actions.ts`  
Always starts with `"use server"`.

### Standard return type
```ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### Error resolver (copy this pattern)
```ts
function resolveError(err: unknown): string {
  if (err instanceof AuthError) return "Please sign in to continue.";
  if (err instanceof ValidationError) return err.message;
  if (err instanceof NotFoundError) return err.message;
  if (err instanceof ForbiddenError) return err.message;
  console.error("[ActionName]", err);
  return "An unexpected error occurred. Please try again.";
}
```

### Auth actions (special case)
`app/(auth)/login/actions.ts` calls `createServerClient()` directly — NOT the DAL.  
Supabase auth bypasses `data/mutations`.

### Existing Server Actions
- `app/(auth)/login/actions.ts` → `signInWithGoogle()`, `signOut()`
- `app/(dashboard)/bookings/actions.ts` → `createBookingAction()`, `cancelBookingAction()`
- `app/(dashboard)/profile/actions.ts` → `updateProfileAction()`
- `app/(dashboard)/wishlist/actions.ts` → `addToWishlistAction()`, `removeFromWishlistAction()`
- `app/(dashboard)/reviews/actions.ts` → `createReviewAction()`, `updateReviewAction()`, `deleteReviewAction()`

---

## 6. Supabase Auth

- Provider: `"google"` — callback: `${origin}/api/auth/callback`
- Session refresh: automatic via `middleware.ts` → `lib/supabase/middleware.ts updateSession()`
- Middleware excludes: `_next/static`, `_next/image`, `favicon`, `images`
- Role from JWT: `user.app_metadata.role ?? user.user_metadata.role ?? "customer"`

---

## 7. Adding a New Domain — Checklist

Example: adding `promotions`.

```
1. data/dto/promotions.ts
   → ValidatePromoSchema, ValidatePromoInput

2. data/queries/promotions.ts
   → getPromotionByCode(code: string): Promise<Promotion>
   → requireAuth() if user-scoped
   → return plain object

3. data/mutations/promotions.ts
   → applyPromotion(input: ValidatePromoInput)
   → safeParse → .issues (Zod v4)
   → requireAuth()
   → db.$transaction() if multi-table

4. app/(dashboard)/promotions/actions.ts
   → "use server"
   → applyPromotionAction() → ActionResult<...>
   → calls data/mutations — NOT db directly

5. Server Component
   → import { getPromotionByCode } from "@/data/queries/promotions"
```

---

## 8. Type-Check Command

```bash
cd /home/micahjordan/programming/nextjs/travel-tour && npx tsc --noEmit
```
Expected: 0 errors.  Run this after every file you create or modify.
