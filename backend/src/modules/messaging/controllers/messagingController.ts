import { type Request, type Response, type NextFunction } from 'express';
import { messagingService } from '../services/messagingService.js';
import {
  createConversationSchema,
  conversationPaginationSchema,
  messageCursorSchema,
  addParticipantSchema,
  contactRecommendationSchema,
} from '../validators/index.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';

// ─── Create Conversation ──────────────────────────────────────────────────────

async function createConversation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = createConversationSchema.parse(req.body);

    const conversation = await messagingService.createConversation(
      userId,
      data.type,
      data.participantIds,
      data.type === 'GROUP' ? data.name : undefined
    );

    res.status(201).json({ status: 'success', data: conversation });
  } catch (err) {
    next(err);
  }
}

// ─── Get Conversations ────────────────────────────────────────────────────────

async function getConversations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page, limit } = conversationPaginationSchema.parse(req.query);

    const result = await messagingService.getConversations(userId, page, limit);

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function getBusinessConversationRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const rawLimit = typeof req.query['limit'] === 'string' ? Number.parseInt(req.query['limit'], 10) : 8;
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 8;

    const recommendations =
      await messagingService.getBusinessConversationRecommendations(userId, limit);

    res.status(200).json({ status: 'success', data: recommendations });
  } catch (err) {
    next(err);
  }
}

async function getConversationRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const rawLimit = typeof req.query['limit'] === 'string' ? Number.parseInt(req.query['limit'], 10) : 8;
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 8;

    const recommendations = await messagingService.getConversationRecommendations(userId, limit);

    res.status(200).json({ status: 'success', data: recommendations });
  } catch (err) {
    next(err);
  }
}

async function getContactConversationRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { contacts, limit } = contactRecommendationSchema.parse(req.body);

    const recommendations =
      await messagingService.getContactConversationRecommendations(userId, contacts, limit ?? 8);

    res.status(200).json({ status: 'success', data: recommendations });
  } catch (err) {
    next(err);
  }
}

// ─── Get Conversation ────────────────────────────────────────────────────────

async function getConversation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id: conversationId } = req.params as { id: string };

    if (!conversationId) {
      throw new AppError(400, 'Conversation ID is required.');
    }

    const conversation = await messagingService.getConversation(conversationId, userId);

    res.status(200).json({ status: 'success', data: conversation });
  } catch (err) {
    next(err);
  }
}

// ─── Get Messages ─────────────────────────────────────────────────────────────

async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id: conversationId } = req.params as { id: string };

    if (!conversationId) {
      throw new AppError(400, 'Conversation ID is required.');
    }

    const { cursor, limit } = messageCursorSchema.parse(req.query);

    const result = await messagingService.getMessages(conversationId, userId, cursor, limit);

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

// ─── Mark As Read ─────────────────────────────────────────────────────────────

async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id: conversationId } = req.params as { id: string };

    if (!conversationId) {
      throw new AppError(400, 'Conversation ID is required.');
    }

    await messagingService.markAsRead(conversationId, userId);

    res.status(200).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}

// ─── Add Participant ──────────────────────────────────────────────────────────

async function addParticipant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const requesterId = req.user!.userId;
    const { id: conversationId } = req.params as { id: string };

    if (!conversationId) {
      throw new AppError(400, 'Conversation ID is required.');
    }

    const { userId } = addParticipantSchema.parse(req.body);

    await messagingService.addParticipant(conversationId, requesterId, userId);

    res.status(200).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}

// ─── Remove Participant ───────────────────────────────────────────────────────

async function removeParticipant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const requesterId = req.user!.userId;
    const { id: conversationId, userId } = req.params as { id: string; userId: string };

    if (!conversationId || !userId) {
      throw new AppError(400, 'Conversation ID and user ID are required.');
    }

    await messagingService.removeParticipant(conversationId, requesterId, userId);

    res.status(200).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}

// ─── Send Message ─────────────────────────────────────────────────────────────

async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const senderId = req.user!.userId;
    const { id: conversationId } = req.params as { id: string };

    if (!conversationId) {
      throw new AppError(400, 'Conversation ID is required.');
    }

    const content: string | undefined =
      typeof req.body['content'] === 'string' ? (req.body['content'] as string) : undefined;

    const mediaFile = req.file as Express.Multer.File | undefined;

    if (!content && !mediaFile) {
      throw new AppError(400, 'Message must have content or a media attachment.');
    }

    const message = await messagingService.sendMessage(
      senderId,
      conversationId,
      content,
      mediaFile
    );

    res.status(201).json({ status: 'success', data: message });
  } catch (err) {
    next(err);
  }
}

export const messagingController = {
  createConversation,
  getConversation,
  getConversations,
  getConversationRecommendations,
  getContactConversationRecommendations,
  getBusinessConversationRecommendations,
  getMessages,
  markAsRead,
  addParticipant,
  removeParticipant,
  sendMessage,
};
