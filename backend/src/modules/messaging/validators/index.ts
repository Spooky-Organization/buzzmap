import { z } from 'zod';

// ─── Create Conversation ──────────────────────────────────────────────────────

export const createConversationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('DIRECT'),
    participantIds: z
      .array(z.string().uuid())
      .length(1, 'DIRECT conversations require exactly one other participant'),
    name: z.undefined().optional(),
  }),
  z.object({
    type: z.literal('GROUP'),
    participantIds: z
      .array(z.string().uuid())
      .min(1, 'GROUP conversations require at least one other participant'),
    name: z.string().min(1, 'Group name is required').max(100),
  }),
]);

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

// ─── Send Message ─────────────────────────────────────────────────────────────

export const sendMessageSchema = z
  .object({
    content: z.string().min(1).max(10000).optional(),
  })
  .refine(
    (data) => data.content !== undefined,
    'Message must have content or a media file'
  );

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const conversationPaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

export type ConversationPaginationInput = z.infer<typeof conversationPaginationSchema>;

export const messageCursorSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 30))
    .pipe(z.number().int().min(1).max(100)),
});

export type MessageCursorInput = z.infer<typeof messageCursorSchema>;

// ─── Add / Remove Participant ─────────────────────────────────────────────────

export const addParticipantSchema = z.object({
  userId: z.string().uuid(),
});

export type AddParticipantInput = z.infer<typeof addParticipantSchema>;

export const contactRecommendationSchema = z.object({
  limit: z.number().int().min(1).max(20).optional(),
  contacts: z
    .array(
      z.object({
        name: z.string().max(120).optional(),
        phone: z.string().min(3).max(40),
      })
    )
    .min(1)
    .max(100),
});

export type ContactRecommendationInput = z.infer<typeof contactRecommendationSchema>;
