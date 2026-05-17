# Messaging Module

## Purpose

Provides authenticated conversation and message handling over both REST and Socket.IO. The module supports:

- direct and group conversations
- paginated conversation and message retrieval
- text and media messages
- participant management for group conversations
- read receipts and typing events

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | REST endpoints for conversations and messages |
| `controllers/messagingController.ts` | Request parsing and standardized responses |
| `services/messagingService.ts` | Conversation, message, unread-count, and room-broadcast logic |
| `socket.ts` | `/messaging` namespace auth and realtime event wiring |
| `models/index.ts` | Conversation, preview, message, and pagination types |
| `validators/index.ts` | Conversation creation, pagination, cursor, and participant validation |

## REST Routes

Mounted under `/api/v1/messages`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/conversations` | Create a direct or group conversation | Yes |
| `GET` | `/conversations` | List conversations for the current user | Yes |
| `GET` | `/conversations/:id` | Get a single conversation | Yes |
| `GET` | `/conversations/:id/messages` | Get messages in a conversation | Yes |
| `PATCH` | `/conversations/:id/read` | Mark unread messages as read | Yes |
| `POST` | `/conversations/:id/participants` | Add a participant to a group conversation | Yes |
| `DELETE` | `/conversations/:id/participants/:userId` | Remove a participant from a group conversation | Yes |
| `POST` | `/conversations/:id/messages` | Send a message with optional `media` upload | Yes |

## Socket.IO Namespace

Namespace: `/messaging`

Authentication:

- accepts a JWT in `socket.handshake.auth.token`
- also accepts `Authorization: Bearer <token>` from handshake headers

Events:

| Event | Direction | Notes |
|---|---|---|
| `message:send` | client -> server | Payload: `{ conversationId, content? }` |
| `message:new` | server -> room | Emitted after persistence |
| `message:typing` | client -> server | Payload: `{ conversationId }` |
| `message:typing` | server -> room | Emits `{ userId, conversationId }` |
| `message:read` | client -> server | Payload: `{ conversationId }` |
| `message:read` | server -> room | Emitted after mark-as-read succeeds |
| `error` | server -> client | Validation or processing failure |

There are no `join-conversation` or `leave-conversation` socket events. On connect, the namespace loads the user's conversations and joins the socket to each corresponding `conv:<conversationId>` room automatically.

## Validation Rules

- direct conversation creation requires exactly one other participant
- group conversation creation requires at least one other participant and a `name`
- message list uses cursor pagination with `limit` defaulting to `30`
- sent messages must contain either text content, a media file, or both

## Implementation Notes

- Direct conversations are deduplicated. If the same two users already have a direct conversation, the existing record is returned.
- `getConversations` returns preview objects including participants, last message, and unread count.
- Media attachments are uploaded through shared storage middleware and persisted as `mediaUrl`.
- Read receipts update message rows and then broadcast to the conversation room.
