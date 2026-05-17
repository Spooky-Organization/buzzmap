# Users Module

## Purpose

Handles user profile and social-graph operations for authenticated users.

The module supports:

- current-user profile retrieval and update
- public profile lookup by user ID
- interest updates
- follower and following lists
- mutual-follow friend detection
- follow and unfollow actions

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Authenticated user routes |
| `controllers/userController.ts` | Auth assertion, validation, and standardized responses |
| `services/userService.ts` | Profile retrieval/update, sanitization, follow logic, and pagination queries |
| `models/index.ts` | Profile and relationship DTOs |
| `validators/index.ts` | Profile, interests, and pagination validation |

## Routes

Mounted under `/api/v1/users`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/me` | Get the current user's full profile | Yes |
| `PATCH` | `/me` | Update the current user's profile | Yes |
| `PATCH` | `/me/interests` | Replace the current user's interests array | Yes |
| `GET` | `/me/followers` | Get paginated followers | Yes |
| `GET` | `/me/following` | Get paginated following list | Yes |
| `GET` | `/me/friends` | Get mutual follows | Yes |
| `GET` | `/:id` | Get a public profile by user ID | Yes |
| `POST` | `/:id/follow` | Follow a user | Yes |
| `DELETE` | `/:id/follow` | Unfollow a user | Yes |

## Validation Rules

| Field | Notes |
|---|---|
| `name` | Optional, min `2` chars |
| `avatar` | Optional URL |
| `interests` | Non-empty string array |
| `page` / `limit` | Default `1 / 20`, max `100` |

## Implementation Notes

- All routes run behind router-level `authenticate`.
- Full profile and public profile are separate service paths.
- Follow logic blocks self-follow and duplicate follows.
- Profile and interest text fields are sanitized in the service layer before persistence.
- Followers and following use offset pagination; friends return a direct list of mutual connections.
