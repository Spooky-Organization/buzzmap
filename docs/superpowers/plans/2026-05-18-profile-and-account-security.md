# Profile And Account Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken user profile page with a real cross-role profile workspace, add self-service profile editing for customers and business owners, and implement authenticated password change across the stack.

**Architecture:** Extend the user domain so public and private profile responses match the real schema, add an authenticated password-change path in the user module, and rebuild the frontend profile route so it renders as a public profile for visitors and an editable account workspace for the owner. Business owners reuse the existing business profile API for business-specific edits while shared account fields stay under the users API.

**Tech Stack:** Next.js App Router, React Query, NextAuth, Express, Prisma, PostgreSQL, Zod, bcrypt

---

### File Map

- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/modules/users/models/index.ts`
- Modify: `backend/src/modules/users/validators/index.ts`
- Modify: `backend/src/modules/users/services/userService.ts`
- Modify: `backend/src/modules/users/controllers/userController.ts`
- Modify: `backend/src/modules/users/routes.ts`
- Modify: `frontend/src/lib/routes.ts`
- Modify: `frontend/src/app/user/[id]/page.tsx`
- Modify: `CHANGELOG.md`

### Implementation Tasks

- [ ] Add `bio` to the Prisma `User` model and generate the matching migration/client update.
- [ ] Extend user profile DTOs, validators, and services to support:
  - `bio`
  - `phone`
  - `location`
  - `avatar`
  - public `isFollowing`
- [ ] Add authenticated self password change in the users module with:
  - current password verification
  - minimum password length validation
  - bcrypt re-hash on save
- [ ] Rebuild `/user/[id]` so it supports:
  - public profile presentation
  - follow/unfollow for non-owners
  - editable own-profile section
  - business-owner business-profile section
  - account security section for password change
- [ ] Verify backend build, frontend lint, and frontend build.

### Verification Commands

- [ ] Run: `cd backend && npm run build`
- [ ] Run: `cd frontend && npm run lint`
- [ ] Run: `cd frontend && npm run build`
