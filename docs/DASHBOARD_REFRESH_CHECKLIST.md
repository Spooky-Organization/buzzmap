# Dashboard Refresh Checklist

Updated: 2026-05-18

## Scope

- [x] Shared dashboard frame across roles
- [x] Customer dashboard landing page
- [x] Business dashboard landing page
- [x] Admin control plane landing page
- [x] Customer dashboard loading state
- [x] Business dashboard loading state

## Shared Design Rules

- [x] Consistent hero section with role-specific eyebrow, icon, and summary
- [x] Consistent metric-card language with gradient accent, icon chip, and supporting note
- [x] Consistent section panels with icon-led headers and action links
- [x] Consistent card depth, border treatment, and hover behavior
- [x] Consistent spacing rhythm inside the shared dashboard shell

## Customer Dashboard

- [x] Added a role-specific hero that frames discovery, orders, POV creation, and alerts
- [x] Replaced flat stats with richer metric cards
- [x] Upgraded active-orders panel styling and hierarchy
- [x] Upgraded recent-POVs panel styling and empty state
- [x] Preserved existing links to orders, notifications, cart, and POV creation

## Business Dashboard

- [x] Added a business-operations hero focused on storefront health, reviews, and order flow
- [x] Replaced flat stats with richer metric cards
- [x] Added stronger links into shelf, analytics, and orders
- [x] Upgraded recent-POVs panel styling and empty state
- [x] Preserved existing business-only data flow and authorization assumptions

## Admin Control Plane

- [x] Refreshed hero with control-plane framing
- [x] Refreshed metric cards, core-area cards, and top-businesses panel
- [x] Refined operational-focus treatment
- [x] Preserved existing admin route and query contracts

## Notes For Future Work

- [ ] Bring secondary role pages such as analytics, orders, notifications, and catalog sections onto the same hero-and-panel system
- [ ] Normalize mobile-specific dashboard spacing and density across every non-landing dashboard page
- [ ] Replace remaining raw `<img>` usage in the public business profile with `next/image` so frontend lint returns fully clean
