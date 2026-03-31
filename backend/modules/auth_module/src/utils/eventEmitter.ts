/**
 * Event Emitter
 * Centralized event publishing for the application
 * Used to trigger SSE events and notifications
 */

import {
  publishNotification,
  publishSessionSync,
  publishUserUpdate,
  publishSystemMessage,
} from "./sseManager";

export type EventType =
  | "USER_REGISTERED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "ROLE_CHANGED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "SESSION_REVOKED"
  | "PASSWORD_CHANGED"
  | "EMAIL_VERIFIED";

export interface EventPayload {
  userId: string;
  data?: Record<string, unknown>;
  actorId?: string;
}

/**
 * Event mapping to notification types (for future use with event subscribers)
 */
const EVENT_NOTIFICATION_MAP: Record<EventType, { type: "info" | "success" | "warning" | "error"; title: string }> = {
  USER_REGISTERED: { type: "success", title: "Welcome!" },
  USER_UPDATED: { type: "info", title: "Profile Updated" },
  USER_DELETED: { type: "warning", title: "Account Deleted" },
  ROLE_CHANGED: { type: "info", title: "Role Changed" },
  MFA_ENABLED: { type: "success", title: "MFA Enabled" },
  MFA_DISABLED: { type: "warning", title: "MFA Disabled" },
  SESSION_REVOKED: { type: "warning", title: "Session Ended" },
  PASSWORD_CHANGED: { type: "success", title: "Password Changed" },
  EMAIL_VERIFIED: { type: "success", title: "Email Verified" },
};

export { EVENT_NOTIFICATION_MAP };

/**
 * Publish an event
 */
export const publishEvent = async (
  event: EventType,
  payload: EventPayload
): Promise<void> => {
  const { userId, data } = payload;

  // Publish SSE event
  switch (event) {
    case "USER_REGISTERED":
      await publishNotification(userId, {
        type: "success",
        title: "Welcome to BuzzMap!",
        message: "Your account has been created successfully.",
      });
      break;

    case "USER_UPDATED":
      await publishUserUpdate(userId, data || {});
      await publishNotification(userId, {
        type: "info",
        title: "Profile Updated",
        message: "Your profile has been updated.",
      });
      break;

    case "USER_DELETED":
      await publishNotification(userId, {
        type: "warning",
        title: "Account Deleted",
        message: "Your account has been deleted.",
      });
      break;

    case "ROLE_CHANGED":
      await publishNotification(userId, {
        type: "info",
        title: "Role Changed",
        message: `Your role has been changed to ${data?.["newRole"] || "a new role"}.`,
      });
      break;

    case "MFA_ENABLED":
      await publishNotification(userId, {
        type: "success",
        title: "MFA Enabled",
        message: "Two-factor authentication has been enabled on your account.",
      });
      break;

    case "MFA_DISABLED":
      await publishNotification(userId, {
        type: "warning",
        title: "MFA Disabled",
        message: "Two-factor authentication has been disabled on your account.",
      });
      break;

    case "SESSION_REVOKED":
      await publishSessionSync(userId, "logout");
      await publishNotification(userId, {
        type: "info",
        title: "Session Ended",
        message: "One of your sessions has been ended.",
      });
      break;

    case "PASSWORD_CHANGED":
      await publishSessionSync(userId, "refresh");
      await publishNotification(userId, {
        type: "success",
        title: "Password Changed",
        message: "Your password has been changed successfully.",
      });
      break;

    case "EMAIL_VERIFIED":
      await publishNotification(userId, {
        type: "success",
        title: "Email Verified",
        message: "Your email address has been verified.",
      });
      break;
  }

  // Log event (could be extended to store in database)
  console.log(`[Event] ${event} published for user ${userId}`);
}

/**
 * Notify user directly
 */
export const notifyUser = async (
  userId: string,
  notification: {
    type: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    actionUrl?: string;
  }
): Promise<void> => {
  await publishNotification(userId, notification);
};

/**
 * Broadcast system message to user
 */
export const broadcastSystemMessage = async (
  userId: string,
  message: string
): Promise<void> => {
  await publishSystemMessage(userId, message);
};

/**
 * Sync session for user
 */
export const syncUserSession = async (
  userId: string,
  action: "login" | "logout" | "refresh"
): Promise<void> => {
  await publishSessionSync(userId, action);
};
