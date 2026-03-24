import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis";

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string | undefined;
  ip?: string | undefined;
}

/**
 * Performance monitoring configuration
 */
interface PerformanceConfig {
  enabled: boolean;
  slowQueryThreshold: number; // milliseconds
  maxMetricsToStore: number;
  redisKeyPrefix: string;
}

const config: PerformanceConfig = {
  enabled: process.env['NODE_ENV'] !== 'test',
  slowQueryThreshold: 1000, // 1 second
  maxMetricsToStore: 1000,
  redisKeyPrefix: 'perf:',
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  if (!config.enabled) {
    next();
    return;
  }

  const startTime = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response time
  res.send = function(body: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Capture performance metrics
    const metrics: PerformanceMetrics = {
      endpoint: req.originalUrl,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date(),
      userAgent: req.get('User-Agent') || undefined,
      ip: req.ip || undefined,
    };

    // Log slow queries
    if (responseTime > config.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    }

    // Store metrics in Redis (async, don't block response)
    storeMetrics(metrics).catch(err => {
      console.error('Failed to store performance metrics:', err);
    });

    // Call original send
    return originalSend.call(this, body);
  };

  next();
};

/**
 * Store performance metrics in Redis
 */
async function storeMetrics(metrics: PerformanceMetrics): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      return; // Skip if Redis is not connected
    }

    const key = `${config.redisKeyPrefix}${metrics.method}:${metrics.endpoint}`;
    const timestamp = metrics.timestamp.getTime();
    
    // Store metrics with timestamp as score for time-based queries
    await redisClient.zAdd(key, {
      score: timestamp,
      value: JSON.stringify(metrics)
    });

    // Keep only the most recent metrics
    await redisClient.zRemRangeByRank(key, 0, -config.maxMetricsToStore);

    // Set expiration for the key (24 hours)
    await redisClient.expire(key, 86400);
  } catch (error) {
    console.error('Error storing performance metrics:', error);
  }
}

/**
 * Get performance metrics for an endpoint
 */
export async function getPerformanceMetrics(
  endpoint: string,
  method: string,
  timeRange: number
): Promise<PerformanceMetrics[]> {
  try {
    if (!redisClient.isOpen) {
      return [];
    }

    const key = `${config.redisKeyPrefix}${method}:${endpoint}`;
    const now = Date.now();
    const startTime = now - timeRange;

    // Get metrics within time range
    const results = await redisClient.zRangeByScore(key, startTime, now);
    
    return results.map(result => JSON.parse(result) as PerformanceMetrics);
  } catch (error) {
    console.error('Error retrieving performance metrics:', error);
    return [];
  }
}

/**
 * Get performance statistics for an endpoint
 */
export async function getPerformanceStats(
  endpoint: string,
  method: string,
  timeRange: number
): Promise<{
  count: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  slowQueries: number;
  errorRate: number;
}> {
  const metrics = await getPerformanceMetrics(endpoint, method, timeRange);
  
  if (metrics.length === 0) {
    return {
      count: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      slowQueries: 0,
      errorRate: 0,
    };
  }

  const responseTimes = metrics.map(m => m.responseTime);
  const slowQueries = metrics.filter(m => m.responseTime > config.slowQueryThreshold).length;
  const errors = metrics.filter(m => m.statusCode >= 400).length;

  return {
    count: metrics.length,
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    slowQueries,
    errorRate: (errors / metrics.length) * 100,
  };
}

/**
 * Get all monitored endpoints
 */
export async function getMonitoredEndpoints(): Promise<string[]> {
  try {
    if (!redisClient.isOpen) {
      return [];
    }

    const keys = await redisClient.keys(`${config.redisKeyPrefix}*`);
    return keys.map(key => key.replace(config.redisKeyPrefix, ''));
  } catch (error) {
    console.error('Error retrieving monitored endpoints:', error);
    return [];
  }
}

/**
 * Clear performance metrics for an endpoint
 */
export async function clearPerformanceMetrics(
  endpoint: string,
  method: string
): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    const key = `${config.redisKeyPrefix}${method}:${endpoint}`;
    await redisClient.del(key);
  } catch (error) {
    console.error('Error clearing performance metrics:', error);
  }
}

/**
 * Clear all performance metrics
 */
export async function clearAllPerformanceMetrics(): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    const keys = await redisClient.keys(`${config.redisKeyPrefix}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Error clearing all performance metrics:', error);
  }
}

/**
 * Get system performance summary
 */
export async function getSystemPerformanceSummary(): Promise<{
  totalRequests: number;
  averageResponseTime: number;
  slowQueries: number;
  errorRate: number;
  topSlowEndpoints: Array<{ endpoint: string; averageTime: number }>;
}> {
  try {
    const endpoints = await getMonitoredEndpoints();
    const allMetrics: PerformanceMetrics[] = [];

    // Collect metrics from all endpoints
    for (const endpointKey of endpoints) {
      const [method, ...endpointParts] = endpointKey.split(':');
      const endpoint = endpointParts.join(':');
      const metrics = await getPerformanceMetrics(endpoint, method || 'GET', 3600000);
      allMetrics.push(...metrics);
    }

    if (allMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowQueries: 0,
        errorRate: 0,
        topSlowEndpoints: [],
      };
    }

    const responseTimes = allMetrics.map(m => m.responseTime);
    const slowQueries = allMetrics.filter(m => m.responseTime > config.slowQueryThreshold).length;
    const errors = allMetrics.filter(m => m.statusCode >= 400).length;

    // Calculate top slow endpoints
    const endpointStats = new Map<string, { total: number; sum: number }>();
    allMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = endpointStats.get(key) || { total: 0, sum: 0 };
      endpointStats.set(key, {
        total: existing.total + 1,
        sum: existing.sum + metric.responseTime,
      });
    });

    const topSlowEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        averageTime: stats.sum / stats.total,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    return {
      totalRequests: allMetrics.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      slowQueries,
      errorRate: (errors / allMetrics.length) * 100,
      topSlowEndpoints,
    };
  } catch (error) {
    console.error('Error getting system performance summary:', error);
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowQueries: 0,
      errorRate: 0,
      topSlowEndpoints: [],
    };
  }
}
