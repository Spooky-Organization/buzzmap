/**
 * Security Logger
 * Comprehensive security event logging for OWASP A10: Logging & Monitoring
 */

import fs from "fs";
import path from "path";

const LOG_DIRECTORY = path.join(__dirname, "../../logs");
const SECURITY_LOG_FILE = path.join(LOG_DIRECTORY, "security_events.log");
const FAILED_LOGINS_FILE = path.join(LOG_DIRECTORY, "failed_logins.log");
const LOCKOUT_FILE = path.join(LOG_DIRECTORY, "lockouts.log");

if (!fs.existsSync(LOG_DIRECTORY)) {
  fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
}

export enum SecurityEventType {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGIN_LOCKED = "LOGIN_LOCKED",
  LOGIN_BANNED = "LOGIN_BANNED",
  LOGOUT = "LOGOUT",
  TOKEN_REFRESH = "TOKEN_REFRESH",
  TOKEN_INVALID = "TOKEN_INVALID",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED",
  MFA_ENABLED = "MFA_ENABLED",
  MFA_DISABLED = "MFA_DISABLED",
  MFA_VERIFIED = "MFA_VERIFIED",
  MFA_FAILED = "MFA_FAILED",
  ACCOUNT_CREATED = "ACCOUNT_CREATED",
  ACCOUNT_UPDATED = "ACCOUNT_UPDATED",
  ROLE_CHANGED = "ROLE_CHANGED",
  SESSION_LIMIT_EXCEEDED = "SESSION_LIMIT_EXCEEDED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  CSRF_FAILURE = "CSRF_FAILURE",
}

export interface SecurityLogEntry {
  timestamp: string;
  eventType: SecurityEventType;
  userId?: string | undefined;
  email?: string | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  metadata?: Record<string, unknown> | undefined;
}

const getSeverityForEvent = (eventType: SecurityEventType): SecurityLogEntry["severity"] => {
  const severityMap: Record<SecurityEventType, SecurityLogEntry["severity"]> = {
    [SecurityEventType.LOGIN_SUCCESS]: "LOW",
    [SecurityEventType.LOGOUT]: "LOW",
    [SecurityEventType.TOKEN_REFRESH]: "LOW",
    [SecurityEventType.PASSWORD_CHANGED]: "MEDIUM",
    [SecurityEventType.MFA_ENABLED]: "MEDIUM",
    [SecurityEventType.MFA_DISABLED]: "MEDIUM",
    [SecurityEventType.MFA_VERIFIED]: "LOW",
    [SecurityEventType.ACCOUNT_CREATED]: "LOW",
    [SecurityEventType.ACCOUNT_UPDATED]: "LOW",
    [SecurityEventType.PASSWORD_RESET_REQUESTED]: "MEDIUM",
    [SecurityEventType.PASSWORD_RESET_COMPLETED]: "MEDIUM",
    [SecurityEventType.LOGIN_FAILED]: "MEDIUM",
    [SecurityEventType.LOGIN_LOCKED]: "HIGH",
    [SecurityEventType.LOGIN_BANNED]: "CRITICAL",
    [SecurityEventType.TOKEN_INVALID]: "MEDIUM",
    [SecurityEventType.ROLE_CHANGED]: "HIGH",
    [SecurityEventType.SESSION_LIMIT_EXCEEDED]: "MEDIUM",
    [SecurityEventType.SUSPICIOUS_ACTIVITY]: "HIGH",
    [SecurityEventType.RATE_LIMIT_EXCEEDED]: "MEDIUM",
    [SecurityEventType.XSS_ATTEMPT]: "HIGH",
    [SecurityEventType.SQL_INJECTION_ATTEMPT]: "CRITICAL",
    [SecurityEventType.CSRF_FAILURE]: "MEDIUM",
    [SecurityEventType.MFA_FAILED]: "MEDIUM",
  };
  return severityMap[eventType] || "MEDIUM";
};

const formatLogEntry = (entry: SecurityLogEntry): string => {
  const baseLog = `[${entry.timestamp}] [${entry.severity}] [${entry.eventType}] ${entry.message}`;
  const details: string[] = [];

  if (entry.userId) details.push(`userId=${entry.userId}`);
  if (entry.email) details.push(`email=${entry.email}`);
  if (entry.ip) details.push(`ip=${entry.ip}`);
  if (entry.userAgent) details.push(`userAgent="${entry.userAgent}"`);
  if (entry.metadata) details.push(`metadata=${JSON.stringify(entry.metadata)}`);

  return details.length > 0 ? `${baseLog} | ${details.join(" | ")}` : baseLog;
};

const writeToLog = (filePath: string, message: string): void => {
  fs.appendFile(filePath, message + "\n", (err) => {
    if (err) {
      console.error(`Failed to write to security log: ${err.message}`);
    }
  });
};

export const logSecurityEvent = (params: {
  eventType: SecurityEventType;
  userId?: string | undefined;
  email?: string | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
  message: string;
  metadata?: Record<string, unknown> | undefined;
}): void => {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    eventType: params.eventType,
    userId: params.userId,
    email: params.email,
    ip: params.ip,
    userAgent: params.userAgent,
    severity: getSeverityForEvent(params.eventType),
    message: params.message,
    metadata: params.metadata,
  };

  const formattedEntry = formatLogEntry(entry);
  writeToLog(SECURITY_LOG_FILE, formattedEntry);
};

export const logFailedLogin = (ip: string | undefined, email: string, reason?: string): void => {
  const timestamp = new Date().toISOString();
  const ipAddress = ip || "unknown";
  const message = `[${timestamp}] Failed login attempt for email: ${email} from IP: ${ipAddress}${reason ? ` | Reason: ${reason}` : ""}`;

  writeToLog(FAILED_LOGINS_FILE, message);

  logSecurityEvent({
    eventType: SecurityEventType.LOGIN_FAILED,
    email,
    ip: ipAddress,
    message: `Failed login attempt from IP: ${ipAddress}`,
    metadata: { reason },
  });
};

export const logLoginSuccess = (userId: string, email: string, ip?: string, userAgent?: string): void => {
  logSecurityEvent({
    eventType: SecurityEventType.LOGIN_SUCCESS,
    userId,
    email,
    ip,
    userAgent,
    message: `Successful login for user: ${email}`,
  });
};

export const logAccountLockout = (email: string, ip?: string, reason?: string): void => {
  const timestamp = new Date().toISOString();
  const ipAddress = ip || "unknown";
  const message = `[${timestamp}] Account locked: ${email} from IP: ${ipAddress}${reason ? ` | Reason: ${reason}` : ""}`;

  writeToLog(LOCKOUT_FILE, message);

  logSecurityEvent({
    eventType: SecurityEventType.LOGIN_LOCKED,
    email,
    ip: ipAddress,
    message: `Account locked: ${email}`,
    metadata: { reason },
  });
};

export const logAccountBan = (email: string, ip?: string, reason?: string): void => {
  logSecurityEvent({
    eventType: SecurityEventType.LOGIN_BANNED,
    email,
    ip,
    message: `Account permanently banned: ${email}`,
    metadata: { reason },
  });
};

export const logSuspiciousActivity = (
  email: string,
  ip: string | undefined,
  activity: string,
  metadata?: Record<string, unknown>
): void => {
  logSecurityEvent({
    eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
    email,
    ip,
    message: `Suspicious activity detected: ${activity}`,
    metadata,
  });
};

export const logSessionLimitExceeded = (userId: string, email: string, ip?: string): void => {
  logSecurityEvent({
    eventType: SecurityEventType.SESSION_LIMIT_EXCEEDED,
    userId,
    email,
    ip,
    message: `Session limit exceeded for user: ${email}`,
  });
};

export const logRateLimitExceeded = (ip: string, endpoint: string): void => {
  logSecurityEvent({
    eventType: SecurityEventType.RATE_LIMIT_EXCEEDED,
    ip,
    message: `Rate limit exceeded for endpoint: ${endpoint}`,
    metadata: { endpoint },
  });
};

export const getClientInfo = (req: { ip?: string | undefined; get?: (header: string) => string | undefined | undefined }): { ip?: string | undefined; userAgent?: string | undefined } => {
  return {
    ip: req.ip ?? req.get?.("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: req.get?.("user-agent"),
  };
};
