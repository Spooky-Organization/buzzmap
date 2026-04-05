# BuzzMap Frontend

Next.js 16 frontend for **BuzzMap** -- a trust-driven marketplace for East Africa that replaces fake text reviews with authentic video POVs (point-of-view reviews) from real customers. Built with the App Router, React 19, and a fully custom design system.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with `@theme inline` blocks |
| Component Library | [shadcn/ui](https://ui.shadcn.com/) (base-nova style via `@base-ui/react`) |
| Authentication | [NextAuth v5](https://authjs.dev/) (Credentials provider, JWT strategy) |
| Data Fetching | [TanStack Query v5](https://tanstack.com/query) |
| State Management | [Zustand v5](https://zustand.docs.pmnd.rs/) (persisted cart store) |
| Real-time | [Socket.IO Client](https://socket.io/) (notifications + messaging namespaces) |
| HTTP Client | [Axios](https://axios-http.com/) with interceptors |
| Forms | [react-hook-form](https://react-hook-form.com/) + [Zod v4](https://zod.dev/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Toast Notifications | [Sonner](https://sonner.emilkowal.dev/) |
| Video | [react-player](https://github.com/cookpete/react-player) |

---

## Project Structure

```
frontend/
├── Dockerfile.dev              # Development container (node:22-alpine, hot reload)
├── Dockerfile.prod             # Multi-stage production build (standalone output)
├── package.json
├── tsconfig.json               # ES2017 target, bundler module resolution, @/* path alias
├── .env.example                # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL, AUTH_SECRET
└── src/
    ├── proxy.ts                # Route protection (replaces middleware.ts in Next.js 16)
    ├── app/
    │   ├── layout.tsx          # Root layout: Providers wrapper, Geist fonts, Sonner Toaster
    │   ├── page.tsx            # Public landing page with animated hero, features, testimonials
    │   ├── globals.css         # Tailwind v4 config, shadcn tokens, BuzzMap brand colors (oklch)
    │   ├── api/auth/[...nextauth]/
    │   │   └── route.ts        # NextAuth API route handler
    │   ├── (auth)/             # Auth route group
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   ├── register/
    │   │   │   ├── customer/page.tsx
    │   │   │   └── business/page.tsx
    │   │   └── forgot-password/page.tsx
    │   ├── (customer)/         # Protected customer route group
    │   │   ├── layout.tsx
    │   │   ├── feed/page.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── cart/page.tsx
    │   │   ├── orders/page.tsx
    │   │   ├── search/page.tsx
    │   │   ├── pov/create/page.tsx
    │   │   ├── messages/
    │   │   │   ├── page.tsx
    │   │   │   └── [conversationId]/page.tsx
    │   │   └── notifications/page.tsx
    │   ├── business/           # Business owner pages
    │   │   ├── layout.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── analytics/page.tsx
    │   │   ├── shelf/page.tsx
    │   │   ├── orders/page.tsx
    │   │   ├── posts/create/page.tsx
    │   │   ├── settings/page.tsx
    │   │   └── [id]/page.tsx   # Public business profile
    │   └── user/
    │       └── [id]/page.tsx   # Public user profile
    ├── components/
    │   ├── ui/                 # shadcn/ui primitives (button, card, dialog, tabs, etc.)
    │   ├── shared/             # App-wide layout components
    │   │   ├── navbar.tsx
    │   │   ├── sidebar.tsx
    │   │   └── app-sidebar.tsx
    │   ├── feed/               # POV feed components
    │   │   ├── pov-card.tsx
    │   │   └── pov-feed.tsx
    │   └── messaging/          # Real-time chat components
    │       ├── conversation-list.tsx
    │       ├── chat-view.tsx
    │       └── message-bubble.tsx
    ├── hooks/
    │   ├── use-notifications.ts  # Notification queries + Socket.IO real-time listener
    │   ├── useMessages.ts        # Message sending, typing indicators via Socket.IO
    │   ├── useDebounce.ts        # Debounce utility hook
    │   └── use-mobile.ts        # Mobile viewport detection
    ├── lib/
    │   ├── auth.ts             # NextAuth configuration (Credentials provider, JWT callbacks)
    │   ├── auth-types.ts       # Module augmentation for NextAuth types (User, Session, JWT)
    │   ├── api.ts              # Axios instance with auth interceptors
    │   ├── socket.ts           # Socket.IO factory function
    │   └── utils.ts            # General utilities (cn, etc.)
    ├── providers/
    │   ├── index.tsx           # Composed provider tree
    │   ├── auth-provider.tsx   # NextAuth SessionProvider wrapper
    │   ├── query-provider.tsx  # TanStack QueryClientProvider (60s stale time)
    │   └── socket-provider.tsx # Socket.IO context (notifications + messaging namespaces)
    └── store/
        └── cart-store.ts       # Zustand persisted cart (localStorage key: "buzzmap-cart")
```

---

## Theming

BuzzMap uses a dual-color brand identity mapped to shadcn semantic tokens via oklch color space in `globals.css`.

### Brand Colors

| Color | Hex | Role |
|---|---|---|
| Navy Blue | `#1B2A4A` | Primary -- trust, reliability, navigation |
| Amber | `#F59E0B` | Accent -- energy, the "bee" motif, CTAs |
| White | `#FFFFFF` | Backgrounds, primary-foreground |

### How It Works

Tailwind v4's `@theme inline` block in `globals.css` defines brand tokens (`--color-brand-navy`, `--color-brand-amber`) alongside shadcn semantic variables. All color values use oklch for perceptual uniformity:

```css
:root {
  /* Navy Blue -- BuzzMap primary */
  --primary: oklch(0.27 0.07 255);
  --primary-foreground: oklch(0.985 0 0);

  /* Amber -- BuzzMap accent */
  --accent: oklch(0.795 0.16 75);
  --accent-foreground: oklch(0.27 0.07 255);
}
```

Full dark mode support is included. In dark mode, the primary/accent relationship inverts for readability -- amber becomes the primary color while navy tones serve as backgrounds.

The sidebar uses the navy palette (`--sidebar: oklch(0.27 0.07 255)`) with amber highlights for active states.

---

## Route Groups

### `(auth)` -- Authentication

Unauthenticated pages with a shared auth layout:

| Route | Description |
|---|---|
| `/login` | Email/password sign-in |
| `/register/customer` | Customer registration |
| `/register/business` | Business owner registration |
| `/forgot-password` | Password reset flow |

### `(customer)` -- Customer Dashboard (Protected)

Authenticated customer experience with shared navbar/sidebar layout:

| Route | Description |
|---|---|
| `/feed` | Interest-based POV feed |
| `/dashboard` | Customer dashboard |
| `/cart` | Shopping cart (Zustand-persisted) |
| `/orders` | Order history |
| `/search` | Business/product search |
| `/pov/create` | Create a video POV review |
| `/messages` | Conversation list |
| `/messages/[conversationId]` | Individual chat thread |
| `/notifications` | Notification center |

### `business/` -- Business Management

Business owner dashboard and management:

| Route | Description |
|---|---|
| `/business/dashboard` | Business overview |
| `/business/analytics` | Engagement and follower analytics |
| `/business/shelf` | Product/service catalog management |
| `/business/orders` | Incoming order management |
| `/business/posts/create` | Create business posts |
| `/business/settings` | Business profile settings |
| `/business/[id]` | Public business profile page |

### Public Routes

| Route | Description |
|---|---|
| `/` | Landing page (animated hero, features, testimonials, CTAs) |
| `/user/[id]` | Public user profile |

---

## Providers

The provider tree is composed in `src/providers/index.tsx` and wrapped around the entire app in the root layout:

```
AuthProvider (NextAuth SessionProvider)
  └── QueryProvider (TanStack QueryClientProvider, 60s stale time)
       └── SocketProvider (Socket.IO context for notifications + messaging)
            └── {children}
```

### AuthProvider

Wraps `SessionProvider` from `next-auth/react`. Provides `useSession()` throughout the component tree.

### QueryProvider

Configures TanStack Query with a `QueryClient` using 60-second default stale time. A new `QueryClient` is created per component mount (via `useState`) to avoid cross-request state leakage in SSR.

### SocketProvider

Manages two Socket.IO connections, created only when the user is authenticated:

- **`/notifications`** namespace -- powers real-time notification delivery
- **`/messaging`** namespace -- powers real-time chat messages and typing indicators

Exposes `notificationSocket`, `messagingSocket`, and `isConnected` via React context. Access with the `useSocket()` hook.

---

## Authentication

### NextAuth v5 Configuration (`src/lib/auth.ts`)

- **Provider**: Credentials (email + password)
- **Backend call**: `POST ${NEXT_PUBLIC_API_URL}/api/v1/auth/login`
- **Token strategy**: JWT with custom claims (`role`, `accessToken`, `refreshToken`)
- **Custom sign-in page**: `/login`

### JWT and Session Callbacks

The `jwt` callback persists `role`, `accessToken`, and `refreshToken` from the backend response into the NextAuth JWT. The `session` callback exposes `user.id`, `user.role`, and `accessToken` on the client-side session object.

### Type Augmentation (`src/lib/auth-types.ts`)

Extends NextAuth's `User`, `Session`, and `JWT` interfaces to include BuzzMap-specific fields:

```typescript
interface User {
  role: string;
  accessToken: string;
  refreshToken: string;
}

interface Session {
  user: User & { id: string; role: string };
  accessToken: string;
}
```

### Route Protection (`src/proxy.ts`)

Next.js 16 replaces `middleware.ts` with `proxy.ts`. The proxy wraps NextAuth's `auth()` to protect routes and redirect unauthenticated users to `/login`:

```typescript
export const config = {
  matcher: [
    '/(customer)/:path*',
    '/(business)/:path*',
  ],
};
```

All `(customer)` and `(business)` route groups require authentication. Auth pages and public routes (landing, business profiles, user profiles) remain accessible without a session.

---

## Real-time (Socket.IO)

### Socket Factory (`src/lib/socket.ts`)

Creates namespace-scoped Socket.IO connections with token-based authentication:

```typescript
createSocket('/notifications', token); // Notification events
createSocket('/messaging', token);     // Chat events
```

Connects to `NEXT_PUBLIC_SOCKET_URL` with `autoConnect: false` (manually connected by `SocketProvider` after authentication).

### `useNotifications` Hook

Combines TanStack Query for paginated notification fetching with Socket.IO for real-time updates:

- **`notifications`** -- paginated list from `GET /api/v1/notifications`
- **`unreadCount`** -- from `GET /api/v1/notifications/unread-count`
- **`markRead(id)`** -- marks a single notification as read via `PATCH`
- **`markAllRead()`** -- marks all notifications as read via `PATCH`
- Listens to `notification:new` Socket.IO events and invalidates the query cache automatically

### `useMessages` Hook

Provides real-time messaging capabilities for a specific conversation:

- **`sendMessage(content)`** -- emits `message:send` via Socket.IO
- **`sendTyping(isTyping)`** -- emits `message:typing` for typing indicators
- **`onNewMessage(callback)`** -- registers a callback for incoming `message:new` events
- **`typingUsers`** -- reactive `Set<string>` of users currently typing in the conversation

---

## Components

### Shared (`src/components/shared/`)

- **`navbar.tsx`** -- Top navigation bar with branding, navigation links, and user menu
- **`sidebar.tsx`** / **`app-sidebar.tsx`** -- Collapsible sidebar navigation using shadcn's Sidebar primitive

### Feed (`src/components/feed/`)

- **`pov-card.tsx`** -- Individual POV (video review) card with star ratings, recommendation score, and user attribution
- **`pov-feed.tsx`** -- Scrollable feed of POV cards with interest-based filtering

### Messaging (`src/components/messaging/`)

- **`conversation-list.tsx`** -- List of active conversations with preview text and unread indicators
- **`chat-view.tsx`** -- Full chat interface for a conversation thread
- **`message-bubble.tsx`** -- Individual message bubble with sender/receiver directional styling

### UI Primitives (`src/components/ui/`)

shadcn/ui components using the base-nova style (built on `@base-ui/react`). The full set includes: alert-dialog, avatar, badge, button, card, checkbox, dialog, dropdown-menu, empty, field, input, input-otp, label, popover, scroll-area, select, separator, sheet, sidebar, skeleton, spinner, table, tabs, textarea, toggle, toggle-group, and tooltip.

---

## State Management

### Cart Store (`src/store/cart-store.ts`)

A Zustand store with `persist` middleware that saves the shopping cart to `localStorage` under the key `buzzmap-cart`:

| Method | Description |
|---|---|
| `addItem(item)` | Adds a product or increments quantity if already in cart |
| `removeItem(productId)` | Removes a product entirely |
| `updateQuantity(productId, qty)` | Sets quantity; removes the item if quantity falls to zero |
| `clearCart()` | Empties the entire cart |
| `total()` | Computes the total price across all items |
| `itemCount()` | Computes the total number of items in the cart |

---

## API Client

The Axios instance (`src/lib/api.ts`) is pre-configured with:

- **Base URL**: `NEXT_PUBLIC_API_URL` environment variable
- **Credentials**: `withCredentials: true` for cookie-based CORS
- **Request interceptor**: Automatically attaches the `Authorization: Bearer <token>` header from the active NextAuth session
- **Response interceptor**: Catches `401` responses and signs the user out, redirecting to `/login`

---

## Environment Variables

Copy `.env.example` and fill in the values:

```env
NEXT_PUBLIC_API_URL=       # Backend API base URL (e.g., http://localhost:5000)
NEXT_PUBLIC_SOCKET_URL=    # Socket.IO server URL (e.g., http://localhost:5000)
AUTH_SECRET=               # NextAuth secret for JWT signing (generate with `npx auth secret`)
```

---

## Docker

### Development (`Dockerfile.dev`)

- Base image: `node:22-alpine`
- Installs all dependencies (including devDependencies)
- Runs `npm run dev` for hot reload
- Source directory is typically volume-mounted from the host
- Telemetry disabled via `NEXT_TELEMETRY_DISABLED=1`

### Production (`Dockerfile.prod`)

Multi-stage build optimized for minimal image size:

1. **Builder stage** -- installs dependencies and runs `npm run build` to produce Next.js standalone output
2. **Runner stage** -- copies only the standalone server, static assets, and public directory; runs as a non-root `nextjs` user (UID 1001) via `node server.js`

---

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Production build (standalone output)
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Path Aliases

TypeScript and Next.js are configured with the `@/*` path alias mapping to `./src/*`:

```typescript
import { api } from '@/lib/api';
import { useSocket } from '@/providers/socket-provider';
import { Button } from '@/components/ui/button';
```
