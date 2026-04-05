import { getPrisma } from '../../../shared/prisma/index.js';
import { getIO } from '../../../shared/socket/index.js';
import { uploadToStorage } from '../../../shared/storage/upload.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import type {
  Conversation,
  ConversationPreview,
  Message,
  PaginatedConversations,
  PaginatedMessages,
} from '../models/index.js';

// ─── Select helpers ───────────────────────────────────────────────────────────

const participantSelect = {
  id: true,
  conversationId: true,
  userId: true,
  joinedAt: true,
  user: { select: { id: true, name: true, avatar: true } },
} as const;

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  content: true,
  mediaUrl: true,
  readAt: true,
  createdAt: true,
  sender: { select: { id: true, name: true, avatar: true } },
} as const;

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function assertParticipant(conversationId: string, userId: string): Promise<void> {
  const prisma = getPrisma();
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true },
  });
  if (!participant) {
    throw new AppError(403, 'You are not a participant in this conversation.');
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Create a DIRECT or GROUP conversation.
 * - DIRECT: prevents duplicates between the same two users.
 * - GROUP: requires a name; creator is always added as participant.
 */
async function createConversation(
  creatorId: string,
  type: 'DIRECT' | 'GROUP',
  participantIds: string[],
  name?: string
): Promise<Conversation> {
  const prisma = getPrisma();

  // All participant IDs including creator
  const allParticipantIds = Array.from(new Set([creatorId, ...participantIds]));

  if (type === 'DIRECT') {
    if (allParticipantIds.length !== 2) {
      throw new AppError(400, 'DIRECT conversations must have exactly two participants.');
    }

    // Check if a DIRECT conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: { in: allParticipantIds },
          },
        },
      },
      include: {
        participants: { select: participantSelect },
      },
    });

    // Verify both participants are in the conversation (findFirst + every can match supersets)
    if (existing && existing.participants.length === 2) {
      const ids = existing.participants.map((p) => p.userId).sort();
      const target = [...allParticipantIds].sort();
      if (ids[0] === target[0] && ids[1] === target[1]) {
        return existing as Conversation;
      }
    }
  }

  if (type === 'GROUP' && !name) {
    throw new AppError(400, 'Group conversations require a name.');
  }

  // Verify all participant user IDs exist
  const users = await prisma.user.findMany({
    where: { id: { in: allParticipantIds } },
    select: { id: true },
  });
  if (users.length !== allParticipantIds.length) {
    throw new AppError(404, 'One or more participants not found.');
  }

  const conversation = await prisma.conversation.create({
    data: {
      type,
      name: name ?? null,
      participants: {
        create: allParticipantIds.map((userId) => ({ userId })),
      },
    },
    include: {
      participants: { select: participantSelect },
    },
  });

  return conversation as Conversation;
}

/**
 * Send a message to a conversation.
 * Persists to DB first, then emits via Socket.IO.
 */
async function sendMessage(
  senderId: string,
  conversationId: string,
  content?: string,
  mediaFile?: Express.Multer.File
): Promise<Message> {
  const prisma = getPrisma();

  if (!content && !mediaFile) {
    throw new AppError(400, 'Message must have content or a media attachment.');
  }

  await assertParticipant(conversationId, senderId);

  let mediaUrl: string | null = null;
  if (mediaFile) {
    mediaUrl = await uploadToStorage(mediaFile, 'messages');
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content: content ?? null,
      mediaUrl,
    },
    select: messageSelect,
  });

  // Update conversation updatedAt so it bubbles to top in getConversations
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const result = message as Message;

  // Emit after persisting
  try {
    getIO().of('/messaging').to(`conv:${conversationId}`).emit('message:new', result);
  } catch {
    // Socket.IO unavailable (test environment) — swallow
  }

  return result;
}

/**
 * Get all conversations for a user, with last message preview and unread count.
 */
async function getConversations(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedConversations> {
  const prisma = getPrisma();
  const skip = (page - 1) * limit;

  const [total, conversations] = await Promise.all([
    prisma.conversation.count({
      where: { participants: { some: { userId } } },
    }),
    prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      include: {
        participants: { select: participantSelect },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: messageSelect,
        },
      },
    }),
  ]);

  // Compute unread count per conversation (messages after last readAt for this user)
  const previews: ConversationPreview[] = await Promise.all(
    conversations.map(async (conv) => {
      // Find the most recent readAt timestamp for this user in this conversation
      const lastRead = await prisma.message.findFirst({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          readAt: { not: null },
        },
        orderBy: { readAt: 'desc' },
        select: { readAt: true },
      });

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          readAt: null,
          ...(lastRead?.readAt
            ? { createdAt: { gt: lastRead.readAt } }
            : {}),
        },
      });

      return {
        id: conv.id,
        type: conv.type,
        name: conv.name,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        participants: conv.participants as ConversationPreview['participants'],
        lastMessage: (conv.messages[0] as Message) ?? null,
        unreadCount,
      };
    })
  );

  return {
    data: previews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get messages for a conversation using cursor-based pagination.
 * Cursor is the ID of the oldest message already loaded (load older messages before it).
 */
async function getMessages(
  conversationId: string,
  userId: string,
  cursor?: string,
  limit = 30
): Promise<PaginatedMessages> {
  const prisma = getPrisma();

  await assertParticipant(conversationId, userId);

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(cursor
        ? {
            createdAt: {
              lt: (
                await prisma.message.findUnique({
                  where: { id: cursor },
                  select: { createdAt: true },
                })
              )?.createdAt,
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    select: messageSelect,
  });

  const hasMore = messages.length > limit;
  const data = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return {
    data: data as Message[],
    nextCursor,
  };
}

/**
 * Mark all unread messages in a conversation as read for this user.
 * Only marks messages NOT sent by this user.
 */
async function markAsRead(conversationId: string, userId: string): Promise<void> {
  const prisma = getPrisma();

  await assertParticipant(conversationId, userId);

  const now = new Date();

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: now },
  });

  try {
    getIO()
      .of('/messaging')
      .to(`conv:${conversationId}`)
      .emit('message:read', { conversationId, userId, readAt: now });
  } catch {
    // Socket.IO unavailable — swallow
  }
}

/**
 * Add a participant to a GROUP conversation.
 * Only existing participants may add new members.
 */
async function addParticipant(
  conversationId: string,
  requesterId: string,
  userId: string
): Promise<void> {
  const prisma = getPrisma();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { type: true },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found.');
  }

  if (conversation.type !== 'GROUP') {
    throw new AppError(400, 'Participants can only be added to GROUP conversations.');
  }

  await assertParticipant(conversationId, requesterId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  const existing = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true },
  });

  if (existing) {
    throw new AppError(409, 'User is already a participant in this conversation.');
  }

  await prisma.conversationParticipant.create({
    data: { conversationId, userId },
  });
}

/**
 * Remove a participant from a GROUP conversation.
 * Only existing participants may remove members (or themselves).
 */
async function removeParticipant(
  conversationId: string,
  requesterId: string,
  userId: string
): Promise<void> {
  const prisma = getPrisma();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { type: true },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found.');
  }

  if (conversation.type !== 'GROUP') {
    throw new AppError(400, 'Participants can only be removed from GROUP conversations.');
  }

  await assertParticipant(conversationId, requesterId);

  const target = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true },
  });

  if (!target) {
    throw new AppError(404, 'User is not a participant in this conversation.');
  }

  await prisma.conversationParticipant.delete({
    where: { conversationId_userId: { conversationId, userId } },
  });
}

/**
 * Lightweight helper for the socket namespace to fetch conversation IDs for a user.
 */
async function getConversationsForSocket(userId: string): Promise<{ id: string }[]> {
  const prisma = getPrisma();
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true },
  });
  return participants.map((p) => ({ id: p.conversationId }));
}

/**
 * Get a single conversation by ID, including participants.
 * Verifies the requesting user is a participant.
 */
async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation> {
  const prisma = getPrisma();

  await assertParticipant(conversationId, userId);

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: { select: participantSelect },
    },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found.');
  }

  return conversation as Conversation;
}

export const messagingService = {
  createConversation,
  getConversation,
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  addParticipant,
  removeParticipant,
  getConversationsForSocket,
};
