# UI Glassmorphism Upgrade - Design Spec

**Date:** 2026-03-28
**Scope:** Frontend UI only — no backend changes
**Approach:** CSS Custom Properties + Tailwind Plugin (Approach A)
**Component Library:** Radix UI primitives + shadcn/ui (mix strategy)

---

## 1. Theme System & Glassmorphism Tokens

### Problem
Theming is done via manual `isDark ? 'bg-gray-800' : 'bg-white'` ternaries scattered across every component, causing inconsistency and dark-text-on-dark-background bugs.

### Solution
All theming moves to CSS custom properties scoped under `.dark` (default) and `.light` classes, consumed by Tailwind. Components use semantic token classes — no `isDark` checks.

### CSS Variables (`theme.css`)

```css
:root,
.dark {
  --background:            #0a0e1a;
  --background-secondary:  #111827;
  --foreground:            #f1f5f9;
  --foreground-muted:      #94a3b8;

  --glass-bg:              rgba(255, 255, 255, 0.05);
  --glass-border:          rgba(255, 255, 255, 0.10);
  --glass-shadow:          0 8px 32px rgba(0, 0, 0, 0.3);
  --glass-blur:            12px;

  --card-bg:               rgba(255, 255, 255, 0.06);
  --card-border:           rgba(255, 255, 255, 0.08);
  --card-hover:            rgba(255, 255, 255, 0.10);

  --sidebar-bg:            rgba(15, 23, 42, 0.80);
  --sidebar-border:        rgba(255, 255, 255, 0.08);

  --input-bg:              rgba(255, 255, 255, 0.05);
  --input-border:          rgba(255, 255, 255, 0.12);
  --input-focus:           rgba(59, 130, 246, 0.50);
}

.light {
  --background:            #f8fafc;
  --background-secondary:  #ffffff;
  --foreground:            #0f172a;
  --foreground-muted:      #64748b;

  --glass-bg:              rgba(255, 255, 255, 0.70);
  --glass-border:          rgba(255, 255, 255, 0.60);
  --glass-shadow:          0 8px 32px rgba(0, 0, 0, 0.08);
  --glass-blur:            12px;

  --card-bg:               rgba(255, 255, 255, 0.80);
  --card-border:           rgba(0, 0, 0, 0.06);
  --card-hover:            rgba(255, 255, 255, 0.95);

  --sidebar-bg:            rgba(255, 255, 255, 0.80);
  --sidebar-border:        rgba(0, 0, 0, 0.08);

  --input-bg:              rgba(255, 255, 255, 0.80);
  --input-border:          rgba(0, 0, 0, 0.12);
  --input-focus:           rgba(59, 130, 246, 0.40);
}
```

### Tailwind Config Additions

Extend `tailwind.config.js` with:
- `colors.background` / `colors.foreground` / `colors.glass.*` referencing CSS vars
- `backdropBlur.glass: 'var(--glass-blur)'`
- `boxShadow.glass: 'var(--glass-shadow)'`
- `darkMode: 'class'` (already using class-based)

### Color Palette
Keep existing blue (`#3B82F6`) primary and indigo (`#6366F1`) secondary unchanged. Only fix contrast issues through the new token system.

---

## 2. Layout Fixes (Sidebar + Navbar Alignment)

### Problems
1. Sidebar and top bar don't share a unified header line — visual disconnect
2. Mobile hamburger button (`fixed top-4 left-4 z-[60]`) is a separate element overlapping the top bar
3. Competing z-indexes between sidebar (`z-50`), hamburger (`z-[60]`), and top bar (`z-40`)
4. Content area uses fragile `pt-16` on mobile to avoid hamburger overlap

### Layout Structure

```
┌──────────────────────────────────────────────┐
│  <html class="dark">                         │
│  ┌────────┬─────────────────────────────────┐│
│  │        │  Top Bar (glass, z-30)          ││
│  │Sidebar │  [hamburger] ... [live] [theme] ││
│  │(glass) ├─────────────────────────────────┤│
│  │ z-50   │                                 ││
│  │ fixed  │  Main Content (scrollable)      ││
│  │ h-full │                                 ││
│  │        │                                 ││
│  │        ├─────────────────────────────────┤│
│  │        │  Footer                         ││
│  └────────┴─────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

### Changes
- **Sidebar**: Keep `fixed left-0 top-0 h-screen z-50`. Apply `bg-[var(--sidebar-bg)] backdrop-blur-xl border-r border-[var(--sidebar-border)]`
- **Top bar**: `sticky top-0 z-30`. Apply `bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)]`. Move hamburger button **inside** the top bar (left side) for mobile
- **Remove** the separate fixed hamburger button element
- **Content area**: Remove fragile `pt-16` mobile padding — content flows naturally below sticky top bar
- **Z-index hierarchy**: Sidebar overlay `z-40`, Sidebar `z-50`, top bar `z-30`
- **Theme toggle**: Replace Sun/Moon button with a Radix Switch component with Sun/Moon icons

---

## 3. Component Replacement Strategy

### Replacements

| Current Component | Replacement | Source |
|---|---|---|
| `Button.tsx` | `button.tsx` with `cva` variants | shadcn/ui (Radix Slot) |
| `Card.tsx` | `glass-card.tsx` with glass tokens | Custom (CSS vars) |
| `Input.tsx` | `input.tsx` with glass styling | shadcn/ui |
| `PasswordInput.tsx` | `password-input.tsx` wrapping new Input | Custom (keeps logic) |
| `Tooltip.tsx` | `tooltip.tsx` | Radix `@radix-ui/react-tooltip` |
| `LoadingSpinner.tsx` | Keep, restyle with tokens | No structural change |
| `LiveStatus.tsx` | Keep, restyle with tokens | No structural change |
| `PasswordRequirements.tsx` | Keep, restyle with tokens | No structural change |
| `ErrorMessage.tsx` | Keep, restyle with tokens | No structural change |
| Checkbox (native) | `checkbox.tsx` | Radix `@radix-ui/react-checkbox` |
| Dropdown (Header) | `dropdown-menu.tsx` | shadcn/ui (Radix) |
| Theme toggle | `switch.tsx` with Sun/Moon | Radix `@radix-ui/react-switch` |

### New Components

| Component | Purpose | Source |
|---|---|---|
| `avatar.tsx` | User avatar (sidebar, header, tables) | Radix `@radix-ui/react-avatar` |
| `badge.tsx` | Role/status badges | Custom with `cva` |
| `table.tsx` | User management table | Custom with glass styling |
| `select.tsx` | Filter dropdowns | Radix `@radix-ui/react-select` |
| `dialog.tsx` | Modals (Add User, confirmations) | shadcn/ui (Radix) |
| `tabs.tsx` | Settings/profile sections | Radix `@radix-ui/react-tabs` |

### New Dependencies

```
@radix-ui/react-tooltip
@radix-ui/react-dropdown-menu
@radix-ui/react-switch
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-select
@radix-ui/react-dialog
@radix-ui/react-slot
@radix-ui/react-tabs
class-variance-authority
```

`tailwind-merge` and `clsx` are already installed.

### Glass Styling Pattern

Every component uses CSS variable references — no `isDark` ternaries:

```tsx
<div className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)]
                shadow-[var(--glass-shadow)] rounded-2xl">
```

### File Structure

```
src/components/ui/
  ├── button.tsx
  ├── glass-card.tsx
  ├── input.tsx
  ├── password-input.tsx
  ├── checkbox.tsx
  ├── switch.tsx
  ├── tooltip.tsx
  ├── avatar.tsx
  ├── badge.tsx
  ├── dropdown-menu.tsx
  ├── select.tsx
  ├── dialog.tsx
  ├── tabs.tsx
  ├── table.tsx
  ├── loading-spinner.tsx  (restyled)
  └── live-status.tsx      (restyled)
```

Filenames use kebab-case (shadcn convention). All page imports updated accordingly.

### Utility File

Add `src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This replaces the existing `@/utils/cn` with the standard shadcn pattern (same logic, canonical location). All imports across the codebase update from `@/utils/cn` to `@/lib/utils`. The old `src/utils/cn.ts` file is deleted. Add a `@/lib` path alias in `tsconfig.json` pointing to `src/lib`.

---

## 4. Visual Hierarchy & Typography

### Typography Scale (Inter font, already loaded)

| Role | Size | Weight | Color Token |
|---|---|---|---|
| Page title | `text-2xl` | `font-bold` | `--foreground` |
| Section header | `text-lg` | `font-semibold` | `--foreground` |
| Stat number | `text-3xl` | `font-bold` | `--foreground` |
| Stat label | `text-sm` | `font-medium` | `--foreground-muted` |
| Body text | `text-sm` | `font-normal` | `--foreground-muted` |
| Caption/meta | `text-xs` | `font-normal` | `--foreground-muted` at 70% opacity |
| Badge text | `text-xs` | `font-semibold` | white on colored bg |

### Stat Cards

Each stat card:
- Glass card base
- **Icon container**: 40x40px `rounded-xl` with subtle colored background (e.g., `bg-primary-500/10`)
- **Number**: `text-3xl font-bold text-[var(--foreground)]`
- **Label**: `text-sm text-[var(--foreground-muted)]`
- **Change indicator**: small pill badge in top-right (`bg-emerald-500/15 text-emerald-400` positive, `bg-red-500/15 text-red-400` negative)

### Section Cards

- Section title + icon left, action link right
- `border-b border-[var(--glass-border)]` separator between header and content
- Consistent `p-6` padding

### Badge Variants (via `cva`)

| Badge | Dark Mode Style |
|---|---|
| ADMIN | `bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20` |
| ACCOUNTANT | `bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20` |
| USER | `bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20` |
| Verified | `bg-emerald-500/15 text-emerald-400` |
| Unverified | `bg-red-500/15 text-red-400` |
| Security | `bg-red-500/15 text-red-400` |
| System | `bg-blue-500/15 text-blue-400` |

Light mode equivalents use solid-50 backgrounds and -700 text colors. Badges are the one place where Tailwind `dark:` prefixes are used (e.g., `bg-violet-500/15 dark:bg-violet-500/15 bg-violet-50`), since each badge has a unique color that can't be reduced to a single CSS variable. This is different from the eliminated `isDark` ternaries — `dark:` is a Tailwind-native, zero-JS approach. Configure `darkMode: 'class'` in Tailwind config so `dark:` reads the `.dark` class set by ThemeContext.

---

## 5. Dashboard Pages

### Admin Dashboard

**Page header:** "Welcome back, Admin!" (`text-2xl font-bold`) + subtitle (`text-sm text-[var(--foreground-muted)]`)

**Sample/Mock banner:** Glass card with `bg-amber-500/10 border border-amber-500/20`, amber info icon, text in `text-[var(--foreground)]`

**Stat cards:** 4-card grid (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6`). Each card: glass styling, colored icon container (top-left), change badge (top-right), label below icon, big number at bottom.

**Two-column section:** `grid-cols-1 lg:grid-cols-2 gap-6`
- User Distribution: glass card, horizontal progress bars with `bg-primary-500` fills on `bg-[var(--glass-bg)]` track
- Recent Activity: glass card, list items with Radix Avatar, activity text, timestamp, role Badge

**System Alerts:** Glass card with `bg-amber-500/10` tint, icon + title + description + timestamp per row

### User Dashboard & Accountant Dashboard
Same glass card pattern and typography hierarchy. Different content, no structural changes beyond restyling with tokens.

### Analytics Dashboard
- Stat cards: same 4-card row pattern
- Charts: glass card containers, chart colors unchanged, container gets glass treatment
- Traffic Sources / Device Breakdown: horizontal bars same styling as User Distribution
- Top Pages: glass card with list items, page path + view count + change badge

### Users Management Page
- Search: glass input
- Filters: Radix Select with glass-styled trigger and popover
- Table: glass card container
  - Header: `bg-[var(--glass-bg)]`, `text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]`
  - Rows: `border-b border-[var(--glass-border)]`, `hover:bg-[var(--card-hover)]`
  - User column: Radix Avatar (initials fallback) + name + email
  - Role column: colored Badge
  - Status column: Verified/Unverified Badge
  - Actions: ghost icon buttons (view, edit, delete)
- "Add User" button: primary variant with UserPlus icon

### Profile & Settings Pages
Glass card containers for form sections. Glass inputs. No structural changes.

---

## 6. Authentication Pages

### Layout Change
Switch from current split layout (left branding, right form) to **centered glass card on gradient background** for all auth pages.

### Shared Auth Layout

```
┌──────────────────────────────────────────────┐
│          Gradient background                 │
│          (animated subtle blobs)             │
│                                              │
│        ┌──────────────────────┐              │
│        │  DashLabs logo       │              │
│        │  Title + Subtitle    │              │
│        │  [form fields]       │              │
│        │  [submit button]     │              │
│        │  footer links        │              │
│        └──────────────────────┘              │
│                                              │
└──────────────────────────────────────────────┘
```

### Background
- Dark: `bg-[var(--background)]` with two animated blobs (`bg-primary-500/20`, `bg-secondary-500/15`), `blur-[120px]`, using existing `animate-blob` keyframes from `globals.css`
- Light: same blobs at lighter opacity (`bg-primary-200/30`, `bg-secondary-200/20`)

### Auth Card
- `bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)]`
- `max-w-md w-full mx-auto rounded-2xl p-8`
- Logo centered at top: Shield icon in gradient container + "DashLabs" text

### Form Elements
- Labels: `text-sm font-medium text-[var(--foreground)]`
- Inputs: `bg-[var(--input-bg)] border border-[var(--input-border)] backdrop-blur-sm rounded-lg`
- Focus: `ring-2 ring-[var(--input-focus)] border-transparent`
- Primary button: `bg-primary-600 hover:bg-primary-700 text-white` (solid, not glass — CTA stands out)
- Links: `text-primary-400 hover:text-primary-300` (dark), `text-primary-600 hover:text-primary-700` (light)

### Auth Pages
- **Login:** Email + Password + Remember me (Radix Checkbox) + Forgot password link + Submit + Sign up link
- **Register:** First name + Last name + Email + Password (with PasswordRequirements) + Confirm password + Terms checkbox + Submit + Sign in link
- **Forgot Password:** Email + Submit + Back to login
- **Reset Password:** New password + Confirm password + Submit
- **Verify Email:** Status message with success/pending icon + Resend link
- **Change Password:** Current password + New password + Confirm + Submit
- **MFA pages:** Code input + Submit + Back link

---

## 7. Icons

Keep Lucide React (`lucide-react`) as the icon library. No icon library change — Lucide already provides all needed icons and pairs well with Radix components.

---

## 8. Landing Page

The landing page is **out of scope** for this UI upgrade. Focus is on dashboard pages and auth pages only. The landing page already has its own styling and component set.

---

## 9. Dependencies Summary

### New packages to install:
```
@radix-ui/react-tooltip
@radix-ui/react-dropdown-menu
@radix-ui/react-switch
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-select
@radix-ui/react-dialog
@radix-ui/react-slot
@radix-ui/react-tabs
class-variance-authority
```

### Existing packages (no change):
```
tailwind-merge (already installed)
clsx (already installed)
lucide-react (already installed)
react-hook-form (already installed)
sonner (already installed)
```

---

## 10. Files Changed (Scope)

### New files:
- `src/lib/utils.ts` (cn utility)
- `src/components/ui/button.tsx`
- `src/components/ui/glass-card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/password-input.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/table.tsx`

### Modified files:
- `src/styles/theme.css` (new CSS variables)
- `src/styles/globals.css` (base layer updates for dark/light)
- `tailwind.config.js` (new token extensions)
- `src/components/layout/DashboardLayout.tsx` (layout restructure)
- `src/components/layout/Sidebar.tsx` (glass styling, remove isDark ternaries)
- `src/components/ui/LoadingSpinner.tsx` (restyle)
- `src/components/ui/LiveStatus.tsx` (restyle)
- `src/components/ui/PasswordRequirements.tsx` (restyle)
- `src/components/ui/ErrorMessage.tsx` (restyle)
- `src/pages/auth/Login.tsx` (centered layout, glass card)
- `src/pages/auth/Register.tsx` (centered layout, glass card)
- `src/pages/auth/ForgotPassword.tsx` (centered layout, glass card)
- `src/pages/auth/ResetPassword.tsx` (centered layout, glass card)
- `src/pages/auth/VerifyEmail.tsx` (centered layout, glass card)
- `src/pages/auth/ChangePassword.tsx` (centered layout, glass card)
- `src/pages/mfa/MFALogin.tsx` (glass card)
- `src/pages/mfa/MFASetup.tsx` (glass card)
- `src/pages/mfa/MFAVerify.tsx` (glass card)
- `src/pages/dashboard/AdminDashboard.tsx` (glass cards, typography)
- `src/pages/dashboard/UserDashboard.tsx` (glass cards, typography)
- `src/pages/dashboard/AccountantDashboard.tsx` (glass cards, typography)
- `src/pages/dashboard/AnalyticsDashboard.tsx` (glass cards, typography)
- `src/pages/dashboard/TransactionsDashboard.tsx` (glass cards, typography)
- `src/pages/dashboard/ReportsDashboard.tsx` (glass cards, typography)
- `src/pages/admin/Users.tsx` (glass table, badges, avatar)
- `src/pages/admin/UserDetails.tsx` (glass cards)
- `src/pages/profile/Profile.tsx` (glass cards)
- `src/contexts/ThemeContext.tsx` (minor — ensure class toggle works)

### Deleted files (replaced by new equivalents):
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/PasswordInput.tsx`
- `src/components/ui/Tooltip.tsx`

### Not touched:
- Backend (no changes)
- Landing page components (`Home.tsx`, `NavBar.tsx`, `HeroSection.tsx`, etc.)
- API layer (`src/api/`)
- Auth logic (`src/auth/`)
- Routing (`src/routes/`)
- SEO components
- `src/utils/` (except `cn.ts` import path updates)
