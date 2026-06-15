import { getPrisma } from '../../../shared/prisma/index.js';
import { getIO } from '../../../shared/socket/index.js';
import { uploadToStorage } from '../../../shared/storage/upload.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { notificationService } from '../../notifications/services/notificationService.js';
import { NotificationType } from '../../notifications/models/index.js';
import type {
  Conversation,
  ImportedContact,
  ConversationRecommendation,
  ConversationPreview,
  Message,
  PaginatedConversations,
  PaginatedMessages,
} from '../models/index.js';
import { sanitizeOptionalText } from '../../../shared/utils/sanitize.js';
import { getPhoneLookupVariants, normalizePhoneNumber } from '../../../shared/utils/phone.js';

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

const MESSAGE_NOTIFICATION_PREVIEW_LIMIT = 72;

function buildMessageNotificationBody(content?: string | null, mediaUrl?: string | null): string {
  const trimmed = content?.trim();
  if (trimmed) {
    return trimmed.length > MESSAGE_NOTIFICATION_PREVIEW_LIMIT
      ? `${trimmed.slice(0, MESSAGE_NOTIFICATION_PREVIEW_LIMIT - 1)}…`
      : trimmed;
  }

  if (mediaUrl) {
    return 'Sent you an attachment.';
  }

  return 'Opened a new message thread.';
}

function recommendationTimestamp(value: ConversationRecommendation): number {
  return value.lastInteractionAt?.getTime() ?? 0;
}

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

  const recipients = await prisma.conversationParticipant.findMany({
    where: {
      conversationId,
      userId: { not: senderId },
    },
    select: { userId: true },
  });

  await Promise.all(
    recipients.map(({ userId }) =>
      notificationService.createNotification(
        userId,
        NotificationType.MESSAGE,
        `New message from ${result.sender.name}`,
        buildMessageNotificationBody(result.content, result.mediaUrl),
        {
          conversationId,
          senderId,
          senderName: result.sender.name,
          notificationTarget: 'conversation',
        }
      )
    )
  );

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

async function getBusinessConversationRecommendations(
  userId: string,
  limit = 8
): Promise<ConversationRecommendation[]> {
  const prisma = getPrisma();

  const business = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!business) {
    throw new AppError(403, 'Only business owners can access customer recommendations.');
  }

  const [recentOrders, recentPovs] = await Promise.all([
    prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              businessId: business.id,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: {
        createdAt: true,
        customer: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    }),
    prisma.pOV.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' },
      take: 40,
      select: {
        createdAt: true,
        author: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    }),
  ]);

  const recommendations = new Map<string, ConversationRecommendation>();

  for (const order of recentOrders) {
    if (order.customer.role !== 'CUSTOMER') continue;

    const existing = recommendations.get(order.customer.id);
    if (existing) {
      if (!existing.reasons.includes('Ordered from your business')) {
        existing.reasons.push('Ordered from your business');
      }
      if (!existing.lastInteractionAt || order.createdAt > existing.lastInteractionAt) {
        existing.lastInteractionAt = order.createdAt;
      }
      continue;
    }

    recommendations.set(order.customer.id, {
      userId: order.customer.id,
      name: order.customer.name,
      avatar: order.customer.avatar,
      reasons: ['Ordered from your business'],
      lastInteractionAt: order.createdAt,
    });
  }

  for (const pov of recentPovs) {
    if (pov.author.role !== 'CUSTOMER') continue;

    const existing = recommendations.get(pov.author.id);
    if (existing) {
      if (!existing.reasons.includes('Left a POV review')) {
        existing.reasons.push('Left a POV review');
      }
      if (!existing.lastInteractionAt || pov.createdAt > existing.lastInteractionAt) {
        existing.lastInteractionAt = pov.createdAt;
      }
      continue;
    }

    recommendations.set(pov.author.id, {
      userId: pov.author.id,
      name: pov.author.name,
      avatar: pov.author.avatar,
      reasons: ['Left a POV review'],
      lastInteractionAt: pov.createdAt,
    });
  }

  return Array.from(recommendations.values())
    .sort((a, b) => recommendationTimestamp(b) - recommendationTimestamp(a))
    .slice(0, limit);
}

async function getCustomerConversationRecommendations(
  userId: string,
  limit = 8
): Promise<ConversationRecommendation[]> {
  const prisma = getPrisma();

  const [following, recentOrders, recentPovs] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        createdAt: true,
        following: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    }),
    prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        createdAt: true,
        items: {
          select: {
            product: {
              select: {
                business: {
                  select: {
                    user: {
                      select: { id: true, name: true, avatar: true, role: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.pOV.findMany({
      where: { authorId: userId, businessId: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        createdAt: true,
        business: {
          select: {
            user: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
        },
      },
    }),
  ]);

  const recommendations = new Map<string, ConversationRecommendation>();

  for (const follow of following) {
    if (follow.following.id === userId) continue;

    const existing = recommendations.get(follow.following.id);
    if (existing) {
      if (!existing.reasons.includes('You follow this profile')) {
        existing.reasons.push('You follow this profile');
      }
      if (!existing.lastInteractionAt || follow.createdAt > existing.lastInteractionAt) {
        existing.lastInteractionAt = follow.createdAt;
      }
      continue;
    }

    recommendations.set(follow.following.id, {
      userId: follow.following.id,
      name: follow.following.name,
      avatar: follow.following.avatar,
      reasons: ['You follow this profile'],
      lastInteractionAt: follow.createdAt,
    });
  }

  for (const order of recentOrders) {
    for (const item of order.items) {
      const owner = item.product.business.user;
      if (owner.id === userId) continue;

      const existing = recommendations.get(owner.id);
      if (existing) {
        if (!existing.reasons.includes('You ordered from this business')) {
          existing.reasons.push('You ordered from this business');
        }
        if (!existing.lastInteractionAt || order.createdAt > existing.lastInteractionAt) {
          existing.lastInteractionAt = order.createdAt;
        }
        continue;
      }

      recommendations.set(owner.id, {
        userId: owner.id,
        name: owner.name,
        avatar: owner.avatar,
        reasons: ['You ordered from this business'],
        lastInteractionAt: order.createdAt,
      });
    }
  }

  for (const pov of recentPovs) {
    if (!pov.business) continue;
    const owner = pov.business.user;
    if (owner.id === userId) continue;

    const existing = recommendations.get(owner.id);
    if (existing) {
      if (!existing.reasons.includes('You reviewed this business')) {
        existing.reasons.push('You reviewed this business');
      }
      if (!existing.lastInteractionAt || pov.createdAt > existing.lastInteractionAt) {
        existing.lastInteractionAt = pov.createdAt;
      }
      continue;
    }

    recommendations.set(owner.id, {
      userId: owner.id,
      name: owner.name,
      avatar: owner.avatar,
      reasons: ['You reviewed this business'],
      lastInteractionAt: pov.createdAt,
    });
  }

  return Array.from(recommendations.values())
    .sort((a, b) => recommendationTimestamp(b) - recommendationTimestamp(a))
    .slice(0, limit);
}

async function getContactConversationRecommendations(
  userId: string,
  contacts: ImportedContact[],
  limit = 8
): Promise<ConversationRecommendation[]> {
  const prisma = getPrisma();
  const importedContacts = new Map<
    string,
    {
      matchedContactName: string | null;
      contactOrder: number;
    }
  >();

  for (const [index, contact] of contacts.entries()) {
    const sanitizedPhone = sanitizeOptionalText(contact.phone);
    if (!sanitizedPhone) {
      continue;
    }

    const normalizedPhone = normalizePhoneNumber(sanitizedPhone);
    if (!normalizedPhone) {
      continue;
    }

    const sanitizedName = sanitizeOptionalText(contact.name) ?? null;

    for (const variant of getPhoneLookupVariants(normalizedPhone)) {
      const existing = importedContacts.get(variant);
      if (!existing || (!existing.matchedContactName && sanitizedName)) {
        importedContacts.set(variant, {
          matchedContactName: sanitizedName,
          contactOrder: index,
        });
      }
    }
  }

  if (importedContacts.size === 0) {
    return [];
  }

  const candidates = await prisma.user.findMany({
    where: {
      id: { not: userId },
      phone: { not: null },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      phone: true,
    },
  });

  const recommendations = new Map<
    string,
    ConversationRecommendation & { contactOrder: number }
  >();

  for (const candidate of candidates) {
    if (!candidate.phone) {
      continue;
    }

    let bestMatch:
      | {
          matchedContactName: string | null;
          contactOrder: number;
        }
      | undefined;

    for (const variant of getPhoneLookupVariants(candidate.phone)) {
      const match = importedContacts.get(variant);
      if (match && (!bestMatch || match.contactOrder < bestMatch.contactOrder)) {
        bestMatch = match;
      }
    }

    if (!bestMatch) {
      continue;
    }

    recommendations.set(candidate.id, {
      userId: candidate.id,
      name: candidate.name,
      avatar: candidate.avatar,
      reasons: ['In your contacts'],
      lastInteractionAt: null,
      matchedContactName: bestMatch.matchedContactName,
      contactOrder: bestMatch.contactOrder,
    });
  }

  return Array.from(recommendations.values())
    .sort((a, b) => a.contactOrder - b.contactOrder || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ contactOrder: _contactOrder, ...recommendation }) => recommendation);
}

async function getConversationRecommendations(
  userId: string,
  limit = 8
): Promise<ConversationRecommendation[]> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  if (user.role === 'BUSINESS_OWNER') {
    return getBusinessConversationRecommendations(userId, limit);
  }

  return getCustomerConversationRecommendations(userId, limit);
}

export const messagingService = {
  getConversationRecommendations,
  getContactConversationRecommendations,
  getBusinessConversationRecommendations,
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
