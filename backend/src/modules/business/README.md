# Business Module

## Purpose

Owns business-profile retrieval, business-profile updates, and business follow/unfollow behavior.

This module was refactored to align with the rest of the backend's modular structure and now uses explicit models, validators, a service layer, and a slim controller.

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Business routes plus auth and role middleware composition |
| `controllers/businessController.ts` | Auth assertion, param/body validation, and standardized responses |
| `services/businessService.ts` | Business profile mapping, update logic, follow/unfollow rules, and data access |
| `models/index.ts` | Business profile DTOs |
| `validators/index.ts` | Path param and update-payload validation |

## Routes

Mounted under `/api/v1/business`.

| Method | Path | Description | Auth | Role |
|---|---|---|---|---|
| `GET` | `/profile` | Get the current business owner's profile | Yes | `BUSINESS_OWNER` |
| `PATCH` | `/profile` | Update the current business owner's profile | Yes | `BUSINESS_OWNER` |
| `GET` | `/:id` | Get a public business profile by business ID | Yes | Any |
| `POST` | `/:id/follow` | Follow a business | Yes | Any |
| `DELETE` | `/:id/follow` | Unfollow a business | Yes | Any |

`/profile` has explicit `405` handling for unsupported methods. `/:id` is `GET`-only, and `/:id/follow` is limited to `POST` and `DELETE`.

## Validation Rules

| Field | Notes |
|---|---|
| `id` | UUID |
| `businessName` | Optional, `2-200` chars |
| `description` | Optional, `1-5000` chars |
| `category` | Optional, `1-100` chars |
| `type` | Optional enum: `PRODUCTS` or `SERVICES` |
| `location` | Optional, `1-200` chars |
| `contactInfo` | Optional, `1-200` chars |
| `operatingHours` | Optional JSON object |

Update requests must provide at least one field.

## Implementation Notes

- The service maps persistence fields into a profile response that includes `avgRating`, `reviewCount`, `followerCount`, and `_count` aggregates.
- Public business lookup also returns `isFollowing` for the requesting user.
- Business profile updates sanitize plain-text fields before persistence.
- Follow relationships are stored against the business owner's underlying `userId`, not the business profile ID itself.
