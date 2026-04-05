import { type Request, type Response, type NextFunction } from 'express';
import { config } from '../../config/index.js';

const BLOCKED_USER_AGENTS = [
  'scrapy', 'python-requests', 'go-http-client', 'java/', 'libwww-perl',
  'wget', 'curl', 'httpclient', 'okhttp', 'node-fetch', 'undici',
  'bot', 'crawl', 'spider', 'slurp', 'baiduspider', 'yandexbot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot',
  'bytespider', 'gptbot', 'ccbot', 'anthropic', 'claudebot',
];

const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
];

export function botGuard() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip health check
    if (req.path === '/health') {
      next();
      return;
    }

    // Block missing User-Agent in production
    const ua = req.headers['user-agent'];
    if (config.isProduction && !ua) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    // Block known bot/scraper User-Agents
    if (ua) {
      const uaLower = ua.toLowerCase();
      for (const blocked of BLOCKED_USER_AGENTS) {
        if (uaLower.includes(blocked)) {
          res.status(403).json({ message: 'Forbidden' });
          return;
        }
      }
    }

    // Content-Type validation on requests with bodies
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (contentType) {
        const baseType = contentType.split(';')[0]!.trim().toLowerCase();
        if (!ALLOWED_CONTENT_TYPES.includes(baseType)) {
          res.status(415).json({ message: 'Unsupported Media Type' });
          return;
        }
      }
    }

    next();
  };
}

export function noRobots() {
  return (_req: Request, res: Response): void => {
    res.type('text/plain').send('User-agent: *\nDisallow: /\n');
  };
}
