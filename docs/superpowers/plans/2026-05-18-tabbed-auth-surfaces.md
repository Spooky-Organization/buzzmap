# Tabbed Auth Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign BuzzMap auth pages so login, registration, and password reset consistently expose separate customer and business tabs.

**Architecture:** Introduce a shared auth shell plus a reusable auth audience tab bar that can be embedded across the login, registration, and password reset flows. Keep the backend contracts unchanged and refactor only the frontend composition so customer/business switching is clear without duplicating surrounding layout and styling.

**Tech Stack:** Next.js App Router, React client components, existing shadcn/base-ui primitives, Tailwind CSS, NextAuth, axios API client.

---

## File Structure

- Modify: `frontend/src/app/(auth)/layout.tsx`
  - Upgrade the global auth wrapper into a stronger visual shell that can host the new shared tabbed experience.
- Create: `frontend/src/components/auth/auth-shell.tsx`
  - Shared auth card shell with headline, descriptive copy, and slot areas for tabs and form content.
- Create: `frontend/src/components/auth/auth-audience-tabs.tsx`
  - Reusable customer/business tab switcher for auth pages.
- Create: `frontend/src/components/auth/auth-page-header.tsx`
  - Shared page-level title/description block to keep copy and spacing consistent.
- Modify: `frontend/src/app/(auth)/login/page.tsx`
  - Convert login into the new shell and expose customer/business tabs above the same sign-in form.
- Modify: `frontend/src/app/(auth)/register/customer/page.tsx`
  - Move customer registration into the new shell and add tabs that switch between customer and business registration routes.
- Modify: `frontend/src/app/(auth)/register/business/page.tsx`
  - Preserve the internal account/business step tabs, but wrap the page in the new outer audience tabs and shell.
- Modify: `frontend/src/app/(auth)/forgot-password/page.tsx`
  - Redesign reset flow inside the new shell and expose customer/business tabs for the reset context.
- Modify: `frontend/src/lib/routes.ts`
  - Add any small helper groupings needed for cleaner auth tab routing, without changing current route contracts.
- Update: `CHANGELOG.md`
  - Record the auth redesign batch after implementation.

## Task 1: Shared Auth Shell

**Files:**
- Create: `frontend/src/components/auth/auth-shell.tsx`
- Create: `frontend/src/components/auth/auth-page-header.tsx`
- Modify: `frontend/src/app/(auth)/layout.tsx`

- [ ] Build a reusable auth shell component that owns the strong visual framing, card container, brand area, and content slots.
- [ ] Build a small shared page header component for auth page titles and descriptions.
- [ ] Update the auth layout to use a more intentional branded background and center stage while keeping the existing back-home entry point.

## Task 2: Audience Tabs

**Files:**
- Create: `frontend/src/components/auth/auth-audience-tabs.tsx`
- Modify: `frontend/src/lib/routes.ts`

- [ ] Create a reusable customer/business tab strip that accepts the current audience and target routes.
- [ ] Add any route helpers needed to keep the auth tab call sites simple and consistent.

## Task 3: Login Refactor

**Files:**
- Modify: `frontend/src/app/(auth)/login/page.tsx`

- [ ] Recompose the login page inside the shared auth shell.
- [ ] Add customer/business tabs at the top of the login surface.
- [ ] Keep the same validation and role-based post-login routing behavior.

## Task 4: Registration Refactor

**Files:**
- Modify: `frontend/src/app/(auth)/register/customer/page.tsx`
- Modify: `frontend/src/app/(auth)/register/business/page.tsx`

- [ ] Wrap customer registration in the new shared auth shell with audience tabs.
- [ ] Wrap business registration in the same outer shell and preserve the existing internal account/business step tabs.
- [ ] Keep all existing validation and API submission behavior unchanged.

## Task 5: Password Reset Refactor

**Files:**
- Modify: `frontend/src/app/(auth)/forgot-password/page.tsx`

- [ ] Move forgot-password into the same auth shell.
- [ ] Add customer/business tabs so the reset flow matches the registration/login information architecture.
- [ ] Preserve the anti-enumeration behavior and existing backend POST target.

## Task 6: Verification And Docs

**Files:**
- Update: `CHANGELOG.md`

- [ ] Run `frontend npm run lint` and return to baseline warnings only.
- [ ] Append one concise changelog entry documenting the auth redesign and the new shared auth shell/tab components.
