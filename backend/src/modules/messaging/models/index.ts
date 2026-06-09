import type { ConversationType } from '@prisma/client';

// ─── Participant ───────────────────────────────────────────────────────────────

export interface ParticipantUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: Date;
  user: ParticipantUser;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export interface MessageSender {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  mediaUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
  sender: MessageSender;
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  participants: ConversationParticipant[];
}

export interface ConversationPreview {
  id: string;
  type: ConversationType;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  participants: ConversationParticipant[];
  lastMessage: Message | null;
  unreadCount: number;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateConversationDTO {
  type: ConversationType;
  participantIds: string[];
  name?: string;
}

export interface SendMessageDTO {
  conversationId: string;
  content?: string;
}

export interface GetMessagesDTO {
  cursor?: string;
  limit: number;
}

export interface PaginatedMessages {
  data: Message[];
  nextCursor: string | null;
}

export interface PaginatedConversations {
  data: ConversationPreview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConversationRecommendation {
  userId: string;
  name: string;
  avatar: string | null;
  reasons: string[];
  lastInteractionAt: Date | null;
  matchedContactName?: string | null;
}

export interface ImportedContact {
  name?: string;
  phone: string;
}
