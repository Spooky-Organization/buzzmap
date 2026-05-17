# Admin Control Plane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated admin console that gives `ADMIN` users a distinct control surface over customer, business, moderation, security, and system operations, and route admin logins into that console by default.

**Architecture:** Add a dedicated `/admin` route tree with its own authenticated layout, grouped sidebar navigation, and section pages built from shared admin page-shell primitives. Start with a real admin overview plus route-complete section placeholders so the information architecture is stable, then incrementally replace placeholders with data-backed operational screens using the same shell.

**Tech Stack:** Next.js App Router, React, NextAuth session role-gating, TanStack Query, Tailwind, existing `sidebar`/`card` UI primitives, centralized `appRoutes`

---

## File Structure

- Create: `frontend/src/app/admin/layout.tsx`
  - Owns `ADMIN` auth gate and shared admin shell
- Create: `frontend/src/app/admin/page.tsx`
  - Admin overview landing page
- Create: `frontend/src/app/admin/users/page.tsx`
- Create: `frontend/src/app/admin/businesses/page.tsx`
- Create: `frontend/src/app/admin/catalog/page.tsx`
- Create: `frontend/src/app/admin/orders/page.tsx`
- Create: `frontend/src/app/admin/moderation/page.tsx`
- Create: `frontend/src/app/admin/messages/page.tsx`
- Create: `frontend/src/app/admin/announcements/page.tsx`
- Create: `frontend/src/app/admin/security/page.tsx`
- Create: `frontend/src/app/admin/system/page.tsx`
- Create: `frontend/src/app/admin/settings/page.tsx`
- Create: `frontend/src/app/admin/audit-log/page.tsx`
- Create: `frontend/src/components/admin/admin-sidebar.tsx`
  - Grouped `Monitor` / `Operate` / `Govern` navigation
- Create: `frontend/src/components/admin/admin-page-shell.tsx`
  - Shared title, description, status badges, action slot, content wrapper
- Create: `frontend/src/components/admin/admin-placeholder-section.tsx`
  - Shared placeholder pattern for unimplemented section pages
- Modify: `frontend/src/lib/routes.ts`
  - Add centralized admin route registry
- Modify: `frontend/src/app/(auth)/login/page.tsx`
  - Redirect `ADMIN` users to admin overview after sign-in
- Modify: `frontend/src/proxy.ts`
  - Protect `/admin` route tree
- Create: `backend/src/modules/admin/routes.ts`
- Create: `backend/src/modules/admin/controllers/adminController.ts`
- Create: `backend/src/modules/admin/services/adminService.ts`
- Create: `backend/src/modules/admin/models/index.ts`
- Create: `backend/src/modules/admin/validators/index.ts`
- Create: `backend/src/modules/admin/README.md`
- Modify: `backend/src/core/routes.ts`
  - Mount the new admin API namespace under `/api/v1/admin`
- Modify: `CHANGELOG.md`
  - Record the admin-console scaffolding batch

## Task 1: Define Admin Routes

**Files:**
- Modify: `frontend/src/lib/routes.ts`
- Test: `frontend/src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Add admin routes to the route registry**

```ts
admin: {
  overview: '/admin',
  users: '/admin/users',
  businesses: '/admin/businesses',
  catalog: '/admin/catalog',
  orders: '/admin/orders',
  moderation: '/admin/moderation',
  messages: '/admin/messages',
  announcements: '/admin/announcements',
  security: '/admin/security',
  system: '/admin/system',
  settings: '/admin/settings',
  auditLog: '/admin/audit-log',
},
```

- [ ] **Step 2: Verify imports that depend on `appRoutes` still type-check**

Run: `npm run lint`
Expected: no new route-key errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/routes.ts
git commit -m "feat: add admin route registry"
```

## Task 2: Add Admin Layout and Sidebar Shell

**Files:**
- Create: `frontend/src/app/admin/layout.tsx`
- Create: `frontend/src/components/admin/admin-sidebar.tsx`
- Test: `frontend/src/app/business/layout.tsx`

- [ ] **Step 1: Build the shared admin sidebar**

```tsx
const monitorItems = [
  { href: appRoutes.admin.overview, label: 'Overview', icon: LayoutDashboard },
  { href: appRoutes.admin.security, label: 'Security', icon: ShieldCheck },
  { href: appRoutes.admin.system, label: 'System', icon: Activity },
  { href: appRoutes.admin.auditLog, label: 'Audit Log', icon: ScrollText },
];
```

- [ ] **Step 2: Build the admin layout with strict role gating**

```tsx
if (status === 'unauthenticated') {
  router.replace(appRoutes.auth.login);
  return null;
}

if (session?.user.role !== 'ADMIN') {
  router.replace(appRoutes.customer.dashboard);
  return null;
}
```

- [ ] **Step 3: Match the mobile shell behavior already used by dashboard layouts**

Run: inspect customer/business layouts and keep the same `SidebarProvider`, `SidebarInset`, and mobile `SidebarTrigger` pattern
Expected: admin shell behaves consistently with the other dashboard shells

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/admin/layout.tsx frontend/src/components/admin/admin-sidebar.tsx
git commit -m "feat: add admin shell and role gate"
```

## Task 3: Build the Admin Overview and Section Placeholders

**Files:**
- Create: `frontend/src/components/admin/admin-page-shell.tsx`
- Create: `frontend/src/components/admin/admin-placeholder-section.tsx`
- Create: `frontend/src/app/admin/page.tsx`
- Create: `frontend/src/app/admin/users/page.tsx`
- Create: `frontend/src/app/admin/businesses/page.tsx`
- Create: `frontend/src/app/admin/catalog/page.tsx`
- Create: `frontend/src/app/admin/orders/page.tsx`
- Create: `frontend/src/app/admin/moderation/page.tsx`
- Create: `frontend/src/app/admin/messages/page.tsx`
- Create: `frontend/src/app/admin/announcements/page.tsx`
- Create: `frontend/src/app/admin/security/page.tsx`
- Create: `frontend/src/app/admin/system/page.tsx`
- Create: `frontend/src/app/admin/settings/page.tsx`
- Create: `frontend/src/app/admin/audit-log/page.tsx`

- [ ] **Step 1: Create a shared admin page shell**

```tsx
export function AdminPageShell({
  title,
  description,
  badge,
  children,
}: AdminPageShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Build the overview as a real control-plane landing page**

```tsx
const overviewCards = [
  { title: 'Users', href: appRoutes.admin.users, summary: 'Manage customers, business owners, and admins.' },
  { title: 'Businesses', href: appRoutes.admin.businesses, summary: 'Review verification, quality, and supply-side health.' },
  { title: 'Moderation', href: appRoutes.admin.moderation, summary: 'Handle POVs, comments, posts, and reports.' },
];
```

- [ ] **Step 3: Create section pages for every core admin area**

```tsx
export default function AdminUsersPage() {
  return (
    <AdminPlaceholderSection
      title="Users"
      description="Control identities, roles, verification, and account states."
      capabilities={[
        'Filter customers, business owners, and admins',
        'Inspect account history and linked activity',
        'Suspend, restore, verify, and escalate accounts',
      ]}
    />
  );
}
```

- [ ] **Step 4: Verify every sidebar item resolves to a real route**

Run: `npm run build`
Expected: no missing-route or unresolved-import errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/admin frontend/src/components/admin
git commit -m "feat: scaffold admin overview and section pages"
```

## Task 4: Route Admin Users Into the Admin Console

**Files:**
- Modify: `frontend/src/app/(auth)/login/page.tsx`
- Modify: `frontend/src/proxy.ts`
- Test: `frontend/src/app/admin/layout.tsx`

- [ ] **Step 1: Redirect `ADMIN` users after login**

```tsx
if (role === 'ADMIN') {
  router.push(appRoutes.admin.overview);
} else if (role === 'BUSINESS_OWNER') {
  router.push(appRoutes.business.dashboard);
} else {
  router.push(appRoutes.customer.feed);
}
```

- [ ] **Step 2: Protect the admin route tree in the proxy matcher**

```ts
matcher: [
  '/admin/:path*',
  '/feed/:path*',
  '/dashboard/:path*',
]
```

- [ ] **Step 3: Verify role behavior manually**

Run:
- sign in as `testadmin@gmail.com`
- sign in as seeded customer
- sign in as seeded business owner

Expected:
- admin lands on `/admin`
- customer stays on customer flow
- business owner lands on `/business/dashboard`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/(auth)/login/page.tsx frontend/src/proxy.ts
git commit -m "feat: redirect admins to admin console"
```

## Task 5: Document and Verify

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Record the batch**

```md
## YYYY-MM-DD HH:MM EAT | Batch: admin-console-scaffold
```

- [ ] **Step 2: Run verification**

Run:
- `cd frontend && npm run lint`
- `cd frontend && npm run build`

Expected:
- lint passes or only shows pre-approved non-import warnings
- build passes

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md docs/superpowers/plans/2026-05-17-admin-control-plane.md
git commit -m "docs: add admin control plane plan"
```

## Task 6: Add the Backend Admin API Namespace

**Files:**
- Create: `backend/src/modules/admin/routes.ts`
- Create: `backend/src/modules/admin/controllers/adminController.ts`
- Create: `backend/src/modules/admin/services/adminService.ts`
- Create: `backend/src/modules/admin/models/index.ts`
- Create: `backend/src/modules/admin/validators/index.ts`
- Create: `backend/src/modules/admin/README.md`
- Modify: `backend/src/core/routes.ts`

- [ ] **Step 1: Mount a dedicated admin namespace**

```ts
app.use('/api/v1/admin', adminRoutes);
```

- [ ] **Step 2: Gate every admin route with authentication plus `authorize('ADMIN')`**

```ts
router.use(authenticate);
router.use(authorize('ADMIN'));
```

- [ ] **Step 3: Expose read-oriented operational endpoints**

```ts
router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.get('/businesses', adminController.getBusinesses);
router.get('/catalog', adminController.getCatalog);
router.get('/orders', adminController.getOrders);
router.get('/moderation', adminController.getModeration);
router.get('/messages', adminController.getMessages);
router.get('/security', adminController.getSecurity);
router.get('/system', adminController.getSystem);
router.get('/settings', adminController.getSettings);
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/modules/admin backend/src/core/routes.ts
git commit -m "feat: add admin api namespace"
```

## Task 7: Implement Data-Backed Admin Read Models

**Files:**
- Create: `backend/src/modules/admin/services/adminService.ts`
- Create: `backend/src/modules/admin/models/index.ts`
- Create: `backend/src/modules/admin/validators/index.ts`

- [ ] **Step 1: Implement overview aggregation from existing schema**

```ts
const [totalUsers, totalBusinesses, totalListings, totalOrders, pendingReports] =
  await Promise.all([
    prisma.user.count(),
    prisma.businessProfile.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);
```

- [ ] **Step 2: Implement paginated user, business, catalog, and order directory queries**

```ts
const where: Prisma.UserWhereInput = {
  ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
  ...(role && { role }),
};
```

- [ ] **Step 3: Implement moderation, messages, security, system, and settings summaries from current tables/config**

```ts
return {
  pendingReports,
  recentReports,
  recentPovs,
  recentComments,
};
```

- [ ] **Step 4: Keep unsupported areas honest**

Expected:
- `announcements` and `audit-log` should stay frontend-scaffolded until real persistence exists
- do not invent fake database-backed history that the schema cannot support

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/admin
git commit -m "feat: add admin service aggregations"
```

## Task 8: Wire Frontend Admin Pages to the New Admin APIs

**Files:**
- Modify: `frontend/src/lib/routes.ts`
- Modify: `frontend/src/app/admin/page.tsx`
- Modify: `frontend/src/app/admin/users/page.tsx`
- Modify: `frontend/src/app/admin/businesses/page.tsx`
- Modify: `frontend/src/app/admin/catalog/page.tsx`
- Create or modify: `frontend/src/app/admin/orders/page.tsx`
- Create or modify: `frontend/src/app/admin/moderation/page.tsx`
- Create or modify: `frontend/src/app/admin/messages/page.tsx`
- Create or modify: `frontend/src/app/admin/security/page.tsx`
- Create or modify: `frontend/src/app/admin/system/page.tsx`

- [ ] **Step 1: Add admin API route registry entries**

```ts
admin: {
  overview: `${API_PREFIX}/admin/overview`,
  users: `${API_PREFIX}/admin/users`,
  businesses: `${API_PREFIX}/admin/businesses`,
  catalog: `${API_PREFIX}/admin/catalog`,
  orders: `${API_PREFIX}/admin/orders`,
  moderation: `${API_PREFIX}/admin/moderation`,
  messages: `${API_PREFIX}/admin/messages`,
  security: `${API_PREFIX}/admin/security`,
  system: `${API_PREFIX}/admin/system`,
  settings: `${API_PREFIX}/admin/settings`,
},
```

- [ ] **Step 2: Replace temporary cross-module admin queries with dedicated admin endpoints**

Expected:
- overview no longer assembles data from search/recommendation endpoints
- admin pages depend on the admin namespace instead of customer/business-oriented APIs

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/routes.ts frontend/src/app/admin
git commit -m "feat: connect admin pages to admin api"
```

## Task 9: Upgrade Admin Users Into a Tabbed Directory With In-Shell Modal Review

**Files:**
- Modify: `backend/src/modules/admin/validators/index.ts`
- Modify: `backend/src/modules/admin/services/adminService.ts`
- Modify: `backend/src/modules/admin/controllers/adminController.ts`
- Modify: `backend/src/modules/admin/models/index.ts`
- Modify: `frontend/src/lib/routes.ts`
- Modify: `frontend/src/app/admin/users/page.tsx`
- Create: `frontend/src/components/admin/admin-user-detail-dialog.tsx`

- [ ] **Step 1: Extend the admin users endpoint for role tabs and sort controls**

```ts
sortBy: z.enum(['name', 'createdAt', 'role']).optional(),
sortOrder: z.enum(['asc', 'desc']).optional(),
```

- [ ] **Step 2: Drive user-tab filtering from the backend instead of client-side slicing**

Expected:
- `CUSTOMER` tab calls `/api/v1/admin/users?role=CUSTOMER`
- `BUSINESS_OWNER` tab calls `/api/v1/admin/users?role=BUSINESS_OWNER`
- `ADMIN` tab remains available so elevated accounts do not disappear from management

- [ ] **Step 3: Replace card-grid users with a sortable table view**

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>User</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Location</TableHead>
      <TableHead>Created</TableHead>
      <TableHead className="text-right">Action</TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

- [ ] **Step 4: Add server-backed pagination controls at the bottom**

```tsx
<Button disabled={page === 1}>Previous</Button>
<Button disabled={page === totalPages}>Next</Button>
```

- [ ] **Step 5: Replace `/user/:id` navigation with an in-dashboard modal**

Expected:
- the admin layout stays persistent
- selecting a user opens a modal inside `/admin/users`
- the modal fetches profile details and recent POVs without leaving the admin shell

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/admin frontend/src/app/admin/users/page.tsx frontend/src/components/admin/admin-user-detail-dialog.tsx frontend/src/lib/routes.ts
git commit -m "feat: convert admin users to modal table directory"
```

## Spec Coverage Check

- Dedicated admin control surface: covered by Tasks 2 and 3
- All brainstormed core areas represented in IA: covered by Task 3 route tree and placeholders
- Admin login redirects to admin view: covered by Task 4
- Route protection for admin pages: covered by Task 4
- Shared shell for future expansion: covered by Task 2 and Task 3
- Backend admin namespace and operational read models: covered by Tasks 6 and 7

Plan complete and saved to `docs/superpowers/plans/2026-05-17-admin-control-plane.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
