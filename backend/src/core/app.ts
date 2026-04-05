import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/index.js';
import { botGuard, noRobots } from '../shared/middleware/botGuard.js';

const app = express();

// Trust Cloudflare proxy (X-Forwarded-For, etc.)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Bot & scraper protection
app.use(botGuard());
app.get('/robots.txt', noRobots());

// CORS — locked to frontend origin only
app.use(cors({ origin: config.frontendUrl, credentials: true }));

// Body parsers
app.use(express.json({ limit: config.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.maxFileSize }));

// Health check (used by Docker healthcheck)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export { app };
