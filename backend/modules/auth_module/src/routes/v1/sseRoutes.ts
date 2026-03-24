/**
 * SSE (Server-Sent Events) Routes
 * Real-time event streaming endpoints
 * All SSE endpoints use GET method only
 */

import { Router } from "express";
import { authenticateToken, methodRestriction, requireAdmin, HttpMethod } from "../../middleware";
import {
  notificationStream,
  sessionStream,
  getActiveConnections,
} from "../../controllers/sseController";
import { getSSEStats } from "../../utils/sseManager";

const router = Router();

const getOnly = methodRestriction({ allowed: ["GET"] as HttpMethod[] });

/**
 * @route GET /api/v1/sse/notifications
 * @desc Real-time notification stream
 * @access Private (token via query param)
 * @query token - JWT access token
 * @method GET only
 */
router.get("/notifications", getOnly, notificationStream);

/**
 * @route GET /api/v1/sse/session
 * @desc Multi-device session sync stream
 * @access Private (token via query param)
 * @query token - JWT access token
 * @method GET only
 */
router.get("/session", getOnly, sessionStream);

/**
 * @route GET /api/v1/sse/connections
 * @desc Get active SSE connections for current user
 * @access Private
 * @method GET only
 */
router.get("/connections", getOnly, authenticateToken, getActiveConnections);

/**
 * @route GET /api/v1/sse/stats
 * @desc Get SSE connection statistics (admin only)
 * @access Private (Admin)
 * @method GET only
 */
router.get("/stats", getOnly, authenticateToken, requireAdmin, async (_req, res) => {
  const stats = await getSSEStats();
  res.json(stats);
});

export default router;
