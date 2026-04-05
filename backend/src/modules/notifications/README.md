# Notifications Module

## Objective

The notifications module provides both REST API and real-time WebSocket delivery of user notifications. It persists notifications to the database via Prisma, emits them instantly over Socket.IO to connected clients, and exposes endpoints for querying, filtering, and marking notifications as read.

---

## Architecture

The module follows the **MVCS (Model-View-Controller-Service)** pattern with an additional **Socket.IO** layer for real-time delivery:

```
Client
  |
  |--- REST (Express) -------> routes.ts -> Controller -> Service -> Prisma (DB)
  |
  |--- WebSocket (Socket.IO) -> socket.ts ------------> Service -> Prisma (DB)
                                    |
                          JWT auth middleware
```

**Dual-channel design:** When a notification is created via `notificationService.createNotification()`, it is first persisted to the database and then emitted to the target user's Socket.IO room (`user:<userId>`). This guarantees that no notification is lost even if the user is offline -- they will see it on their next REST fetch.

---

## Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Registers Express routes; applies `authenticate` middleware to all endpoints. |
| `controllers/notificationController.ts` | Handles HTTP request/response lifecycle; validates input via Zod schemas; delegates to the service layer. |
| `services/notificationService.ts` | Core business logic -- CRUD operations against the database, real-time emission via Socket.IO, ownership checks. |
| `models/index.ts` | TypeScript interfaces (`Notification`, `CreateNotificationDTO`, `NotificationListResult`) and the `NotificationType` enum re-exported from Prisma. |
| `validators/index.ts` | Zod schemas for query parameter validation (pagination, read-status filter). |
| `socket.ts` | Sets up the `/notifications` Socket.IO namespace with JWT authentication middleware and real-time event handlers. |

---

## API Routes

All routes are prefixed by the parent router's mount path (e.g., `/api/v1/notifications`).

| Method | Path | Description | Auth Required |
|--------|------|-------------|:------------:|
| `GET` | `/` | Fetch paginated notifications for the authenticated user. Supports `page`, `limit`, and `read` query parameters. | Yes |
| `GET` | `/unread-count` | Return the count of unread notifications for the authenticated user. | Yes |
| `PATCH` | `/:id/read` | Mark a single notification as read. Ownership is verified before update. | Yes |
| `PATCH` | `/read-all` | Mark all unread notifications as read for the authenticated user. Returns the number of notifications updated. | Yes |

### Query Parameters (GET `/`)

| Parameter | Type | Default | Constraints | Description |
|-----------|------|---------|-------------|-------------|
| `page` | string (parsed to int) | `1` | >= 1 | Page number for pagination. |
| `limit` | string (parsed to int) | `20` | 1 -- 100 | Items per page. |
| `read` | `"true"` \| `"false"` | _omitted_ | optional | Filter by read status. Omit to return all. |

---

## Socket.IO Events

The module operates on the `/notifications` namespace.

### Authentication

Clients must provide a valid JWT in the handshake auth object:

```ts
const socket = io('/notifications', {
  auth: { token: '<access_token>' },
});
```

The middleware calls `authService.verifyAccessToken()` and rejects the connection on failure.

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `notification:new` | Server -> Client | Emitted to `user:<userId>` room when a new notification is created and persisted. Payload: full `Notification` object. |
| `notification:markRead` | Client -> Server | Client sends a notification ID to mark as read. |
| `notification:readConfirmed` | Server -> Client | Sent back to the requesting socket after a successful mark-read. Payload: updated `Notification` object. |
| `notification:markAllRead` | Client -> Server | Client requests all unread notifications be marked as read. |
| `notification:allReadConfirmed` | Server -> Client | Sent back after all notifications are marked as read. Payload: `{ count: number }`. |
| `notification:error` | Server -> Client | Sent when a socket event handler encounters an error. Payload: `{ event: string, message: string }`. |

---

## Key Logic

### DB Persistence + Real-Time Emit

`createNotification()` writes the notification to the database first, then emits `notification:new` to the user's Socket.IO room. The Socket.IO emit is wrapped in a try/catch so failures (e.g., in test environments where Socket.IO is not initialized) do not affect persistence.

### JWT Socket Authentication

The `/notifications` namespace applies a Socket.IO middleware that extracts the token from `socket.handshake.auth['token']` and verifies it using `authService.verifyAccessToken()`. On success, the user's ID is stored on `socket.data['userId']` and the socket is automatically joined to the `user:<userId>` room for targeted event delivery.

### Mark Read & Ownership

`markAsRead()` performs an ownership check -- it verifies the notification's `userId` matches the requesting user before updating. A `403` is thrown if the notification belongs to another user. `markAllAsRead()` scopes the bulk update to the authenticated user's unread notifications only.

### Unread Counts

`getUnreadCount()` runs a `count` query filtered by `userId` and `read: false`, giving clients a lightweight way to display badge counts without fetching full notification payloads.

---

## Notification Types

The module supports the following notification types, defined via the Prisma `NotificationType` enum:

| Type | Description |
|------|-------------|
| `POV_POSTED` | A new point-of-view has been posted. |
| `ORDER_UPDATE` | An order status has changed. |
| `NEW_FOLLOWER` | The user has gained a new follower. |
| `MESSAGE` | A new message has been received. |
| `FRIEND_JOINED` | A friend has joined the platform. |

---

## Dependencies

| Dependency | Source | Usage |
|------------|--------|-------|
| `authenticate` middleware | `../../shared/middleware/auth.js` | Protects all REST routes with JWT authentication. |
| `AppError` | `../../shared/middleware/errorHandler.js` | Standardized error responses (401, 403, 404). |
| `getPrisma()` | `../../shared/prisma/index.js` | Database access for notification CRUD operations. |
| `getIO()` | `../../shared/socket/index.js` | Access to the Socket.IO server instance for real-time emission. |
| `authService` | `../auth/services/authService.js` | JWT verification for Socket.IO handshake authentication. |
| `zod` | npm | Query parameter validation and type-safe parsing. |
| `@prisma/client` | npm | ORM types (`Prisma`, `$Enums`) and database operations. |
