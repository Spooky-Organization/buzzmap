# BuzzMap — Standard Operating Procedure (SOP)

**Audience:** Human developers and AI/LLM coding agents working in this repository.
**Status:** Authoritative working agreement. Read this before making changes. It overrides assumptions, not explicit user instructions.

This document defines *how we work* in this repo. For *what changed*, see [`CHANGELOG.md`](./CHANGELOG.md). For *what the product is*, see [`README.md`](./README.md) and [`VISION.md`](./VISION.md).

---

## 1. Golden Rules (read first)

1. **Do NOT run production builds after each change.** Builds are slow and are not the dev feedback loop here. Verify with **lint + type check** only (see §4). Run a build only when explicitly asked.
2. **Respect the running dev environment.** The dev stack is already up with hot reload. Do not restart, rebuild, or tear down containers unless asked. Assume changes are picked up automatically.
3. **Do not run `git` commands during implementation.** The repo owner handles staging, commits, and branches manually at the end. Do not commit, push, branch, or stage on the owner's behalf unless explicitly told to.
4. **Make root-cause changes, not band-aids.** Align frontend with the real backend contract rather than adding null guards over stale field names. (This is a recurring lesson in the changelog history.)
5. **Keep changes inside the established patterns** (§5). New one-off conventions create drift.
6. **Update [`CHANGELOG.md`](./CHANGELOG.md) after a coherent batch**, not after every edit (§6).

---

## 2. Environment Topology

The dev environment runs in a **specific split** — know it before you touch anything:

| Service | Where it runs | Notes |
|---|---|---|
| **Frontend** | **Locally**, in a separate terminal tab (`next dev`) | Hot reload via Next.js. The owner runs this; assume it is already live. |
| **Backend** | **Dev Docker stack** (`docker-compose.dev.yml`) | `tsx watch` hot reload inside the container. Source is bind-mounted. |
| **Postgres / Redis / RustFS** | Dev Docker stack | Data services. |

Implications:
- **Frontend file edits** are picked up by the local `next dev` process — no action needed.
- **Backend file edits** are picked up by `tsx watch` inside the container — no rebuild needed.
- Because the local `next dev` server is running, generated Next types under `.next/types` and `.next/dev/types` exist and stay fresh — this is what makes the frontend type check viable (§4).
- **A second agent/tab may be working concurrently.** Keep write scopes narrow, prefer surgical edits, and do not assume you are the only writer. If a verification result looks contaminated by another tab's in-flight work, note it rather than "fixing" unrelated files.

Compose commands (only if explicitly asked to touch the stack) must use the env file:
```bash
docker compose --env-file .env.dev -f docker-compose.dev.yml <cmd>
```

---

## 3. Repository Map

```
buzzmap/
├── frontend/   # Next.js 16 App Router, React 19, TS, Tailwind v4, shadcn/ui, NextAuth v5
│   └── src/
│       ├── app/          # Route groups: (auth), (customer), business/, admin/, user/
│       ├── components/   # shared/, dashboard/, admin/, auth/, business/, feed/, messaging/, legal/, ui/
│       ├── lib/          # routes.ts (route + API registry), api.ts, auth.ts, messaging.ts
│       ├── hooks/        # data + socket hooks
│       └── providers/    # auth-provider, socket-provider
├── backend/    # Express 5, TS, Prisma v7, Postgres, Redis, Socket.IO
│   └── src/
│       ├── modules/      # MVCS domain modules (auth, users, business, products, search, admin, ...)
│       │   └── <module>/ # models/, validators/, services/, controllers/, routes.ts
│       └── shared/       # middleware, utils, storage, factories
├── docs/       # AUDIT, SECURITY_AUDIT, plans, checklists
├── CHANGELOG.md
├── README.md
├── VISION.md
└── SOP.md      # this file
```

---

## 4. Verification Policy (lint + type check ONLY)

**Never gate work on `npm run build` during normal development.** Use these instead.

### Frontend (`frontend/`)
```bash
cd frontend
npm run lint            # eslint (next config) — primary gate
npx tsc --noEmit        # type check — relies on running dev server's generated .next types
```
- `tsconfig.json` already sets `noEmit: true`, so `tsc --noEmit` is a pure check.
- It includes `.next/types` — valid here **only because the local `next dev` server is running**. If the dev server is down, generated route types may be stale/missing; start the dev server before trusting the type check.
- **Known acceptable warnings:** the pre-existing `@next/next/no-img-element` warnings in `frontend/src/app/business/[id]/page.tsx`. Do not treat these as new failures unless you touched that file and introduced more.

### Backend (`backend/`)
```bash
cd backend
npx tsc --noEmit        # type check (the build script `tsc` emits; use --noEmit to check only)
```
- The backend has no separate lint script; `tsc --noEmit` is the type gate.

### Reporting verification honestly
- State the **exact command run** and its **actual result**. Do not claim "passing" without running it.
- If something fails, say so and show the relevant output. If a check was skipped, say it was skipped.
- Distinguish "0 errors" from "0 errors, N pre-existing warnings".

---

## 5. Coding Conventions (distilled from project history)

### Frontend
- **Centralize routes and API endpoints in `frontend/src/lib/routes.ts`.** Do not hardcode backend URLs or app paths in pages, hooks, or components.
- **API envelopes are unwrapped by `frontend/src/lib/api.ts`.** Paginated backend payloads still carry their own nested `data` arrays — handle that, don't double-unwrap.
- **Role gating lives in layouts**, not scattered in pages:
  - business owner gate → `frontend/src/app/business/layout.tsx`
  - admin gate → `frontend/src/app/admin/layout.tsx`
  - customer shell gate → `frontend/src/components/shared/customer-layout-shell.tsx`
- **Shared navigation must branch on `session.user.role`.** Never hardcode shared sidebar/navbar links to customer routes.
- **`/business/:id` is a public directory page** (reachable signed-out); signed-in visitors see it inside their role shell. Keep it distinct from owner-only `/business/*` management routes.
- **Reuse the shared design system**, don't invent parallel ones:
  - dashboard primitives → `frontend/src/components/dashboard/dashboard-surfaces.tsx` (`DashboardHero`, `DashboardMetricCard`, `DashboardPanel`, ...)
  - loading states → `frontend/src/components/shared/loading-screen.tsx` and `dashboard/loading-skeletons.tsx`
  - auth surfaces → `frontend/src/components/auth/auth-shell.tsx`
  - UI atoms → `frontend/src/components/ui/*` (shadcn/ui). Prefer existing components; add via the shadcn workflow rather than hand-rolling.
- Keep socket instance creation out of effect-driven state sync (lint cleanliness).

### Backend
- **Follow the modular MVCS pattern** per module: `models/`, `validators/` (Zod), `services/` (business logic), `controllers/` (request parse + response only), `routes.ts`.
- **Validate query/body params with Zod schemas in `validators/`** — no ad hoc parsing in controllers. Add new params to the schema.
- **Sanitize user-editable plain-text write paths** with the shared sanitizer (`backend/src/shared/utils/sanitize.ts`). It strips tags — plain text only, not rich HTML.
- **Explicit method restriction** on routes (`405` for disallowed methods); auth routes are rate-limited.
- **`ADMIN` is a super-role** for `authorize(...)` — retains customer- and business-side access unless a rule explicitly carves it out.
- Admin endpoints under `/api/v1/admin/*` are `ADMIN`-only and read-oriented; respond with honest capability notices where the schema lacks persistence rather than inventing data.

### Contract changes
- If a batch changes a frontend↔backend contract, **change both sides** and say so explicitly in the changelog. Enum/field additions used by the UI must be backed by validated backend schema.

---

## 6. Changelog Discipline

Append to [`CHANGELOG.md`](./CHANGELOG.md) using its existing template. Rules (mirrored from that file):
- Add an entry **after a coherent batch**, not after every edit. One high-signal entry per slice.
- Use the EAT-timestamped header format already in the file.
- Include **exact file paths touched**.
- Include **LLM handoff notes**: how to extend the work, any new contract assumptions, follow-up checks/known limits.
- State the verification result (which commands, what outcome).
- No raw diffs. Keep it concise.

---

## 7. Working Loop for an AI Agent

1. **Read context first:** this SOP, the relevant `CHANGELOG.md` entries, and the actual code/contract you're touching.
2. **Confirm scope** with the owner if the task is ambiguous or spans contracts. Prefer the smallest correct change.
3. **Implement** inside existing patterns (§5).
4. **Verify** with lint + type check (§4) — never a build unless asked.
5. **Report** honestly with the commands run and their output.
6. **Changelog** after the batch is coherent (§6).
7. **Stop at git.** Leave staging/commits to the owner (§1.3).
