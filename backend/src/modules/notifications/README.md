# Notifications Module

## Purpose

Handles in-app notifications for authenticated users, including paginated retrieval, unread counts, read-state updates, and realtime notification room wiring.

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | REST routes for listing and updating notifications |
| `controllers/notificationController.ts` | Query parsing and standardized responses |
| `services/notificationService.ts` | Notification retrieval, counting, read-state updates, and socket emission helpers |
| `socket.ts` | `/notifications` namespace setup |
| `models/index.ts` | Notification DTOs and list result types |
| `validators/index.ts` | Query validation for pagination and `read` filtering |

## REST Routes

Mounted under `/api/v1/notifications`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/` | List notifications for the current user | Yes |
| `GET` | `/unread-count` | Get unread notification count | Yes |
| `PATCH` | `/:id/read` | Mark one notification as read | Yes |
| `PATCH` | `/read-all` | Mark all notifications as read | Yes |

## Query Parameters

| Field | Type | Notes |
|---|---|---|
| `page` | `string -> number` | Default `1` |
| `limit` | `string -> number` | Default `20`, max `100` |
| `read` | `'true' | 'false'` | Optional boolean filter |

## Socket.IO Namespace

Namespace: `/notifications`

Authentication:

- requires `socket.handshake.auth.token`

Events:

| Event | Direction | Notes |
|---|---|---|
| `notification:markRead` | client -> server | Marks a single notification as read |
| `notification:readConfirmed` | server -> client | Returns updated notification |
| `notification:markAllRead` | client -> server | Marks all notifications as read |
| `notification:allReadConfirmed` | server -> client | Returns bulk update result |
| `notification:error` | server -> client | Error payload for failed notification actions |

Each socket joins a personal room in the format `user:<userId>`.

## Implementation Notes

- The unread count is exposed through a dedicated endpoint and not bundled into the list response.
- The list response is paginated and can optionally filter by read state.
- Read operations validate ownership through the current authenticated user ID.
