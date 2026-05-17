import type { Message as ChatMessage } from '@/components/messaging/chat-view';
import type { Conversation as ConversationListItem } from '@/components/messaging/conversation-list';

export interface BackendConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface BackendConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  mediaUrl: string | null;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface BackendConversationPreview {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  createdAt: string;
  updatedAt: string;
  participants: BackendConversationParticipant[];
  lastMessage: BackendConversationMessage | null;
  unreadCount: number;
}

export interface BackendConversationDetail {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  createdAt: string;
  updatedAt: string;
  participants: BackendConversationParticipant[];
}

export interface ConversationMeta {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
}

function getOtherParticipant(
  participants: BackendConversationParticipant[],
  currentUserId: string
): BackendConversationParticipant | undefined {
  return participants.find((participant) => participant.userId !== currentUserId);
}

export function toConversationMeta(
  conversation: BackendConversationDetail,
  currentUserId: string
): ConversationMeta {
  const otherParticipant = getOtherParticipant(conversation.participants, currentUserId);

  if (conversation.type === 'GROUP') {
    return {
      id: conversation.id,
      participantId: conversation.id,
      participantName: conversation.name ?? 'Group conversation',
    };
  }

  return {
    id: conversation.id,
    participantId: otherParticipant?.user.id ?? currentUserId,
    participantName: otherParticipant?.user.name ?? 'Unknown user',
    participantAvatar: otherParticipant?.user.avatar ?? undefined,
  };
}

export function toConversationListItem(
  conversation: BackendConversationPreview,
  currentUserId: string
): ConversationListItem {
  const meta = toConversationMeta(conversation, currentUserId);
  const lastMessage = conversation.lastMessage;

  return {
    id: conversation.id,
    participantName: meta.participantName,
    participantAvatar: meta.participantAvatar,
    lastMessage:
      lastMessage?.content ??
      (lastMessage?.mediaUrl ? 'Sent an attachment' : 'No messages yet'),
    lastMessageAt: lastMessage?.createdAt ?? conversation.updatedAt,
    unreadCount: conversation.unreadCount,
  };
}

export function toChatMessage(message: BackendConversationMessage): ChatMessage {
  return {
    id: message.id,
    content: message.content ?? (message.mediaUrl ? 'Sent an attachment' : ''),
    senderId: message.senderId,
    createdAt: message.createdAt,
    isRead: message.readAt !== null,
  };
}
