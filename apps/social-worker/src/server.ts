import express from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { fanoutQueue } from './queues.js';
import { config } from './config.js';
import type { StrapiWebhookPayload, Article } from './types.js';

function verifySignature(raw: Buffer, signature: string): boolean {
  if (!config.server.webhookSecret) return true; // skip verification if no secret set
  const expected = createHmac('sha256', config.server.webhookSecret).update(raw).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function extractTags(entry: StrapiWebhookPayload['entry']): string[] {
  if (!entry.tags) return [];
  return entry.tags.map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean);
}

export function createServer() {
  const app = express();

  // Parse raw body for signature verification, then also parse JSON
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody: Buffer }).rawBody = buf;
      },
    })
  );

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.post('/webhook/strapi', async (req, res) => {
    const sig = req.headers['x-strapi-signature'] as string | undefined;
    const rawBody = (req as express.Request & { rawBody: Buffer }).rawBody;

    if (sig && !verifySignature(rawBody, sig)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = req.body as StrapiWebhookPayload;

    // Only react to article publish events
    if (payload.event !== 'entry.publish' || payload.model !== 'article') {
      return res.json({ ignored: true });
    }

    const { entry } = payload;

    if (!entry.slug || !entry.title) {
      return res.status(400).json({ error: 'Missing slug or title' });
    }

    const article: Article = {
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      description: entry.description ?? '',
      url: `${config.blog.baseUrl}/${entry.slug}`,
      tags: extractTags(entry),
      publishedAt: entry.publishedAt,
    };

    const job = await fanoutQueue.add(`fanout:${article.slug}`, { article }, {
      jobId: `fanout:${article.slug}`, // deduplicate repeated publishes
    });

    console.log(`[server] queued fanout job ${job.id} for "${article.slug}"`);
    return res.json({ queued: true, jobId: job.id });
  });

  return app;
}
