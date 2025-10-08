import { Router } from "express";
import { authenticateToken, requireAdmin } from "../../middleware";
import {
  getPerformanceMetrics,
  getPerformanceStats,
  getMonitoredEndpoints,
  clearPerformanceMetrics,
  clearAllPerformanceMetrics,
  getSystemPerformanceSummary,
} from "../../utils/performanceMonitor";

// Helper function to ensure string type
const ensureString = (value: any, defaultValue: string): string => {
  return typeof value === 'string' ? value : defaultValue;
};

const router = Router();

/**
 * Get performance metrics for a specific endpoint
 * GET /api/admin/performance/:endpoint
 */
router.get(
  "/:endpoint",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const endpoint = req.params['endpoint'];
      if (!endpoint) {
        res.status(400).json({
          error: "Endpoint parameter is required",
          message: "Endpoint parameter is required",
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
        return;
      }

      const { method = "GET", timeRange = "3600000" } = req.query;
      const methodStr = ensureString(method, 'GET');
      const timeRangeNum = parseInt(ensureString(timeRange, '3600000'));
      
      const metrics = await getPerformanceMetrics(
        endpoint,
        methodStr,
        timeRangeNum
      );

      res.json({
        success: true,
        data: {
          endpoint,
          method,
          timeRange: parseInt(timeRange as string),
          metrics,
          count: metrics.length,
        },
      });
    } catch (error) {
      console.error("Error getting performance metrics:", error);
      res.status(500).json({
        error: "Failed to retrieve performance metrics",
        message: "Internal server error",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  }
);

/**
 * Get performance statistics for a specific endpoint
 * GET /api/admin/performance/:endpoint/stats
 */
router.get(
  "/:endpoint/stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const endpoint = req.params['endpoint'];
      if (!endpoint) {
        res.status(400).json({
          error: "Endpoint parameter is required",
          message: "Endpoint parameter is required",
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
        return;
      }

      const { method = "GET", timeRange = "3600000" } = req.query;
      const methodStr = ensureString(method, 'GET');
      const timeRangeNum = parseInt(ensureString(timeRange, '3600000'));
      
      const stats = await getPerformanceStats(
        endpoint,
        methodStr,
        timeRangeNum
      );

      res.json({
        success: true,
        data: {
          endpoint,
          method,
          timeRange: parseInt(timeRange as string),
          stats,
        },
      });
    } catch (error) {
      console.error("Error getting performance stats:", error);
      res.status(500).json({
        error: "Failed to retrieve performance statistics",
        message: "Internal server error",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  }
);

/**
 * Get all monitored endpoints
 * GET /api/admin/performance/endpoints
 */
router.get(
  "/endpoints",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const endpoints = await getMonitoredEndpoints();

      res.json({
        success: true,
        data: {
          endpoints,
          count: endpoints.length,
        },
      });
    } catch (error) {
      console.error("Error getting monitored endpoints:", error);
      res.status(500).json({
        error: "Failed to retrieve monitored endpoints",
        message: "Internal server error",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  }
);

/**
 * Get system performance summary
 * GET /api/admin/performance/summary
 */
router.get(
  "/summary",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const summary = await getSystemPerformanceSummary();

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Error getting performance summary:", error);
      res.status(500).json({
        error: "Failed to retrieve performance summary",
        message: "Internal server error",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  }
);

/**
 * Clear performance metrics for a specific endpoint
 * DELETE /api/admin/performance/:endpoint
 */
router.delete(
  "/:endpoint",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const endpoint = req.params['endpoint'];
      if (!endpoint) {
        res.status(400).json({
          error: "Endpoint parameter is required",
          message: "Endpoint parameter is required",
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
        return;
      }

      const { method = "GET" } = req.query;
      const methodStr = ensureString(method, 'GET');
      await clearPerformanceMetrics(endpoint, methodStr);

      res.json({
        success: true,
        message: `Performance metrics cleared for ${method} ${endpoint}`,
      });
    } catch (error) {
      console.error("Error clearing performance metrics:", error);
      res.status(500).json({
        error: "Failed to clear performance metrics",
        message: "Internal server error",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  }
);

/**
 * Clear all performance metrics
 * DELETE /api/admin/performance
 */
router.delete(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      await clearAllPerformanceMetrics();

      res.json({
        success: true,
        message: "All performance metrics cleared",
      });
    } catch (error) {
      console.error("Error clearing all performance metrics:", error);
      res.status(500).json({
        error: "Failed to clear all performance metrics",
        message: "Internal server error",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  }
);

export default router;
