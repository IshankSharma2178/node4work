# AGENTS.md

Nodebase: AI workflow automation SaaS (n8n/Zapier-style). Next.js 15 (App Router, Turbopack), React 19, tRPC v11, Prisma 6 + Postgres, Better Auth, Polar (payments), Inngest (jobs + realtime), React Flow (`@xyflow/react`), Vercel AI SDK, Tailwind v4, Biome.

## Commands

- `npm run dev` — Next dev server (Turbopack).
- `npm run dev:all` — mprocs: Next + Inngest dev UI (`http://localhost:8288`) + ngrok. Requires `NGROK_URL`.
- `npm run inngest:dev` — Inngest dev UI only; functions are served at `/api/inngest`.
- `npm run lint` — `biome check` only. **No typecheck.**
- `npx tsc --noEmit` — the typecheck (there is no script for it).
- `npm run build` — production build (runs Next's own type checking).
- `npm run format` — `biome format --write`.
- **No test runner is configured.** Verify with `npm run lint` → `npx tsc --noEmit` → `npm run build`.
- Vercel runs `npm run vercel-build` (`prisma generate && next build`) per `vercel.json`.

## Generated code & Prisma

- Prisma client is generated to `src/generated/prisma` (gitignored, not committed). After editing `prisma/schema.prisma`, run `npx prisma generate`; migrations via `npx prisma migrate dev`.
- `prisma.config.ts` uses dotenv + classic engine; schema targets Postgres with `rhel-openssl-3.0.x` binaryTarget for Vercel.
- Env: copy `.env.example` → `.env` (`.env` is gitignored). Required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ENCRYPTION_KEY` (Cryptr for credentials), `POLAR_ACCESS_TOKEN`, `POLAR_SUCCESS_URL`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `NEXT_PUBLIC_APP_URL`, plus Google/GitHub OAuth keys. **`.env.example` has typos** (duplicate `GOOGLE_CLIENT_ID`, `GOOGLE_API_KEYs`, stray spaces) — don't copy blindly.

## Architecture

- **Feature-first modules** in `src/features/` (`auth`, `workflows`, `credentials`, `editor`, `executions`, `trigger`, `subscriptions`). Each owns a tRPC router (`server/routers.ts`), server prefetch (`server/prefetch.ts`), nuqs params (`params.ts`, `server/params-loader.ts`), React Query hooks (`hooks/`), and components. Register new routers in `src/trpc/routers/_app.ts`.
- **tRPC procedures** in `src/trpc/init.ts`: `baseProcedure` → `protectedProcedure` (Better Auth session) → `premiumProcedure` (Polar active subscription, throws `FORBIDDEN`). **`createTRPCContext` is a stub returning `{ userId: "user_123" }` — never trust `ctx.userId`**; auth happens inside the procedures.
- **Server pages** follow: `requireAuth()`/`requireUnauth()` → prefetch → `<HydrateClient>` → client components using `useSuspenseQuery`.
- **Inngest** has a single function `executeWorkflow` (`src/inngest/functions.ts`, event `workflows/execute.workflow`): creates an `Execution`, topologically sorts nodes, threads a `WorkflowContext` through per-node executors, streams realtime status. Dev retries = 0, prod = 3. Executions link to runs via unique `inngestEventId`; `onFailure` marks the execution FAILED.
- **Adding a node type = 5 touchpoints**: `NodeType` enum in `prisma/schema.prisma` (+ migration) → realtime channel in `src/inngest/channels/` → executor in `src/features/executions/components/<type>/executor.ts` + register in `executor-registry.ts` → React Flow node in `<type>/node.tsx` + register in `src/config/node-components.ts` → config dialog `<type>/dialog.tsx` + node-selector entry.
- `workflows.update` **deletes all nodes/edges and recreates them** in a single transaction.
- Credentials are encrypted at rest (Cryptr, `ENCRYPTION_KEY`); decrypted **only inside executors**, never sent to the client.
- Webhook triggers (Google Form/Stripe): workflow id is a query param, payload normalized to `initialData` (`googleForm`/`stripe` keys), then `sendWorkflowExecution`.

## Gotchas

- Realtime status topic shape per channel: `{ nodeId, status: "loading" | "success" | "error" }`.
- `openai/executor.ts:7,52` imports/publishes `anthropicChannel` (copy-paste bug) — check channel imports in the AI executors before editing them.
- `next.config.ts` sets `allowedDevOrigins: ["*"]` for ngrok.
- Biome: 2-space indent, `organizeImports` on, `suspicious.noUnknownAtRules` off (Tailwind). Path alias `@/*` → `./src/*`.
