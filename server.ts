/**
 * RocketStore Central Updates - Express Application Server
 * Full-stack server running Express with Vite middleware in development
 * and serving static dist files in production.
 * Securely handles /api/ai/* routes connecting to Gemini REST API.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GeminiService } from './server/geminiService';
import { validateRegistry } from './src/utils/validator';

// Load environment variables (.env)
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isDev = process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'dev';
const distPath = path.resolve(process.cwd(), 'dist');
const hasBuiltDist = fs.existsSync(path.resolve(distPath, 'index.html'));
const isProduction = process.env.NODE_ENV === 'production' || (!isDev && hasBuiltDist);

// Body parser
app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiter for AI endpoints (max 30 requests/minute per IP)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60000 });
    return next();
  }

  if (record.count >= 30) {
    return res.status(429).json({
      success: false,
      status: 'rate_limited',
      message_ar: 'تجاوزت عدد الطلبات المسموح بها في الدقيقة (30 طلب/دقيقة). يرجى الانتظار قليلاً.',
    });
  }

  record.count++;
  next();
}

// ==========================================
// API ROUTES
// ==========================================

/**
 * 1. AI Status Endpoint
 */
app.get('/api/ai/status', (_req: Request, res: Response) => {
  const status = GeminiService.getStatus();
  res.json(status);
});

/**
 * 2. AI Connection Test Endpoint
 */
app.post('/api/ai/test', rateLimiter, async (_req: Request, res: Response) => {
  try {
    const result = await GeminiService.testConnection();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: 'error',
      model: GeminiService.getModel(),
      message_ar: 'حدث خطأ غير متوقع في الخادم أثناء فحص الاتصال.',
    });
  }
});

/**
 * 3. AI Actions Endpoint
 */
app.post('/api/ai/action', rateLimiter, async (req: Request, res: Response) => {
  const { action, input } = req.body || {};

  if (!action || typeof action !== 'string') {
    return res.status(400).json({
      success: false,
      status: 'bad_request',
      message_ar: 'يرجى تحديد الإجراء المطلوب (action).',
    });
  }

  try {
    switch (action) {
      case 'suggest_name': {
        const result = await GeminiService.suggestName(input || {});
        return res.json(result);
      }
      case 'clean_filename': {
        const rawFilename = input?.rawFilename || input?.filename || '';
        const result = await GeminiService.cleanFilename(rawFilename);
        return res.json(result);
      }
      case 'suggest_apk': {
        const appName = input?.appName || input?.name || 'App';
        const result = await GeminiService.suggestApkFilename({ appName, version: input?.version });
        return res.json(result);
      }
      case 'generate_description': {
        const name = input?.name || 'App';
        const result = await GeminiService.generateDescription({
          name,
          type: input?.type,
          currentDesc: input?.currentDesc || input?.description,
          repository: input?.repository,
        });
        return res.json(result);
      }
      case 'detect_category': {
        const name = input?.name || 'App';
        const result = await GeminiService.detectCategory({
          name,
          description: input?.description,
          repo: input?.repository,
        });
        return res.json(result);
      }
      case 'extract_keywords': {
        const name = input?.name || 'App';
        const result = await GeminiService.extractKeywords({
          name,
          description: input?.description,
          type: input?.type,
        });
        return res.json(result);
      }
      case 'suggest_blogger_title': {
        const name = input?.name || 'App';
        const result = await GeminiService.suggestBloggerTitle({
          name,
          name_ar: input?.name_ar,
          version: input?.version,
          type: input?.type,
        });
        return res.json(result);
      }
      case 'full_analysis': {
        const result = await GeminiService.fullAnalysis(input || {});
        return res.json(result);
      }
      default:
        return res.status(400).json({
          success: false,
          status: 'unknown_action',
          message_ar: `الإجراء المطلوب (${action}) غير معتمد.`,
        });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: 'server_error',
      message_ar: 'حدث خطأ في الخادم أثناء معالجة طلب الذكاء الاصطناعي.',
    });
  }
});

/**
 * 4. Central Registry API (Safe read/write)
 */
const registryFile = path.resolve(process.cwd(), 'apps-registry.json');

app.get('/api/registry', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(registryFile)) {
      const data = JSON.parse(fs.readFileSync(registryFile, 'utf-8'));
      return res.json(data);
    }
    return res.json([]);
  } catch {
    return res.json([]);
  }
});

app.post('/api/registry', (req: Request, res: Response) => {
  const newProducts = req.body;
  const validation = validateRegistry(newProducts);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message_ar: 'البيانات المرسلة غير مطابقة لمعايير apps-registry.json',
      errors: validation.errors,
    });
  }

  try {
    fs.writeFileSync(registryFile, JSON.stringify(newProducts, null, 2) + '\n', 'utf-8');
    return res.json({ success: true, message_ar: 'تم حفظ السجل المركزي بنجاح.' });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message_ar: 'فشل في حفظ ملف السجل على الخادم.',
    });
  }
});

// Explicit 404 handler for unknown API routes (never fallback to index.html for API requests)
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    status: 'not_found',
    message_ar: 'نقطة النهاية المطلوبة غير موجودة في الـ API (404).',
  });
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RocketStore Central Manager running on http://0.0.0.0:${PORT} (${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
