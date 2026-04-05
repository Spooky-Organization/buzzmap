# Messaging Module

## Objective

The messaging module provides real-time and RESTful messaging capabilities for BuzzMap. It supports both direct (1-on-1) and group conversations, with message persistence, media attachments, read receipts, typing indicators, and cursor-based pagination. All real-time functionality is delivered over Socket.IO alongside a traditional REST API for CRUD operations.

## Architecture

The module follows the **MVCS (Model-View-Controller-Service)** pattern with an additional Socket.IO real-time layer:

```
routes.ts              -- Express route definitions (entry point for REST)
socket.ts              -- Socket.IO namespace setup (entry point for real-time)
controllers/           -- Request parsing, validation, and response formatting
services/              -- Core business logic, database access, and event emission
models/                -- TypeScript interfaces and DTOs
validators/            -- Zod schemas for request validation
```

Request flow:

- **REST**: `Route -> Controller -> Validator -> Service -> Prisma -> Response`
- **Socket.IO**: `Namespace -> Auth Middleware -> Event Handler -> Service -> Prisma -> Room Broadcast`

The service layer is shared between REST and Socket.IO paths, ensuring consistent business logic regardless of transport.

## Files and Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Defines Express routes, applies `authenticate` middleware and `upload` (multer) for media |
| `controllers/messagingController.ts` | Parses and validates HTTP requests, delegates to the service, formats JSON responses |
| `services/messagingService.ts` | All business logic: conversation CRUD, message persistence, participant management, unread counts, Socket.IO emission |
| `models/index.ts` | TypeScript interfaces (`Conversation`, `Message`, `ConversationPreview`, DTOs) and pagination types |
| `validators/index.ts` | Zod schemas for input validation (`createConversationSchema`, `sendMessageSchema`, `messageCursorSchema`, etc.) |
| `socket.ts` | Socket.IO `/messaging` namespace: JWT auth middleware, room joining, real-time event handlers |

## API Routes

All routes require authentication via the `authenticate` middleware.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/conversations` | Create a DIRECT or GROUP conversation |
| `GET` | `/conversations` | List conversations for the authenticated user (paginated) |
| `GET` | `/conversations/:id/messages` | Fetch messages in a conversation (cursor-based pagination) |
| `PATCH` | `/conversations/:id/read` | Mark all unread messages in a conversation as read |
| `POST` | `/conversations/:id/participants` | Add a participant to a GROUP conversation |
| `DELETE` | `/conversations/:id/participants/:userId` | Remove a participant from a GROUP conversation |
| `POST` | `/conversations/:id/messages` | Send a message (supports text and/or media file upload) |

## Socket.IO Events

All events operate under the `/messaging` namespace. Authentication is required via a JWT token passed in `socket.handshake.auth.token` or the `Authorization` header.

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client -> Server | Send a text message to a conversation |
| `message:new` | Server -> Client | Broadcast a new message to all participants in the conversation room |
| `message:typing` | Client -> Server | Notify that the user is typing in a conversation |
| `message:typing` | Server -> Client | Broadcast typing indicator to other participants in the room |
| `message:read` | Client -> Server | Mark all unread messages in a conversation as read |
| `message:read` | Server -> Client | Broadcast read receipt to all participants in the conversation room |
| `error` | Server -> Client | Emit validation or processing errors back to the sender |

## Key Logic

### Direct vs. Group Conversations

- **DIRECT**: Exactly two participants. The module enforces deduplication -- if a DIRECT conversation already exists between the same two users, the existing conversation is returned instead of creating a duplicate.
- **GROUP**: Requires a name (1-100 characters). The creator is automatically added as a participant. Supports adding and removing participants after creation.

### Deduplication

When creating a DIRECT conversation, the service queries for an existing conversation of type `DIRECT` where both user IDs are present. It verifies the participant count is exactly 2 and the IDs match before returning the existing record.

### Media Sharing

Messages can include a media attachment uploaded via multipart form data. The `upload.single('media')` multer middleware processes the file, which is then passed to `uploadToStorage()` for persistent storage. A message must contain either text content, a media file, or both.

### Read Receipts

The `markAsRead` function updates all unread messages (where `readAt` is `null` and the sender is not the current user) with the current timestamp. After persistence, a `message:read` event is broadcast to the conversation room via Socket.IO.

### Typing Indicators

Typing events are ephemeral -- they are not persisted to the database. When a client emits `message:typing`, the server broadcasts the event to all other participants in the conversation room using Socket.IO's `socket.to()` (excluding the sender).

### Cursor-Based Pagination

Message retrieval uses cursor-based pagination for efficient loading of message history:
- The `cursor` parameter is the ID of the oldest message already loaded on the client.
- The service fetches `limit + 1` messages older than the cursor's `createdAt` timestamp.
- If more than `limit` results are returned, `hasMore` is true and a `nextCursor` (the ID of the last message in the batch) is provided.
- Default limit is 30 messages per request (max 100).

Conversation listing uses traditional page-based offset pagination (default page size 20, max 100).

### Room Management

On Socket.IO connection, the server automatically joins the authenticated user into all their conversation rooms (prefixed `conv:{conversationId}`). All message broadcasts target these rooms, ensuring only participants receive events.

### Participant Access Control

Every operation that reads or writes conversation data first verifies the requesting user is a participant via the `assertParticipant` helper. Participant management (add/remove) is restricted to GROUP conversations and can only be performed by existing participants.

## Dependencies

| Shared Module | Usage |
|---------------|-------|
| `shared/middleware/auth.ts` | `authenticate` middleware for JWT-based route protection |
| `shared/middleware/errorHandler.ts` | `AppError` class for structured HTTP error responses |
| `shared/storage/upload.ts` | `upload` (multer instance) and `uploadToStorage` for media file handling |
| `shared/prisma/index.ts` | `getPrisma()` for database access |
| `shared/socket/index.ts` | `getIO()` for Socket.IO server instance |
| `shared/utils/logger.ts` | `logger` (pino) for structured logging in socket handlers |
| `modules/auth` | `authService.verifyAccessToken()` for Socket.IO JWT verification |
| `zod` | Runtime request validation schemas |
| `@prisma/client` | `ConversationType` enum (`DIRECT`, `GROUP`) |
