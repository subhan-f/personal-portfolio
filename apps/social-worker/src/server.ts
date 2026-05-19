import express from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { fanoutQueue, promotePendingJobs } from './queues.js';
import { config } from './config.js';
import type { StrapiWebhookPayload, Article } from './types.js';

// ─── Typed request helper ────────────────────────────────────────────────────

type RawRequest = express.Request & { rawBody: Buffer };

// ─── Signature helpers ───────────────────────────────────────────────────────

function verifyStrapiSig(raw: Buffer, signature: string): boolean {
  if (!config.server.webhookSecret) return true;
  const expected = createHmac('sha256', config.server.webhookSecret).update(raw).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Vercel signs its webhooks with HMAC-SHA1 of the raw body.
 * Header: x-vercel-signature
 */
function verifyVercelSig(raw: Buffer, signature: string): boolean {
  if (!config.vercel.webhookSecret) return true;
  const expected = createHmac('sha1', config.vercel.webhookSecret).update(raw).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ─── Payload types ───────────────────────────────────────────────────────────

interface VercelWebhookPayload {
  id: string;
  type: string;
  createdAt: number;
  payload: {
    deployment: { id: string; name: string; url: string };
    project:    { id: string; name: string };
    target?:    string | null;  // "production" | "preview" | null
    url:        string;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractTags(entry: StrapiWebhookPayload['entry']): string[] {
  if (!entry.tags) return [];
  return entry.tags.map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean);
}

// ─── Server ──────────────────────────────────────────────────────────────────

export function createServer() {
  const app = express();

  // Capture raw body for signature verification before JSON parsing
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as RawRequest).rawBody = buf;
      },
    })
  );

  // ── Health ────────────────────────────────────────────────────────────────

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // ── Strapi: article published → park fanout job ───────────────────────────
  //
  // Enqueues a fanout job with a large delay ("parked").
  // The job sits in DELAYED state until the Vercel deploy webhook promotes it.
  // If the Vercel webhook never arrives (e.g. worker was down), the job runs
  // automatically after PARK_DELAY_MS as a safety net.

  app.post('/webhook/strapi', async (req, res) => {
    const sig = req.headers['x-strapi-signature'] as string | undefined;
    const raw = (req as RawRequest).rawBody;

    if (sig && !verifyStrapiSig(raw, sig)) {
      return res.status(401).json({ error: 'Invalid Strapi signature' });
    }

    const payload = req.body as StrapiWebhookPayload;

    if (payload.event !== 'entry.publish' || payload.model !== 'article') {
      return res.json({ ignored: true, reason: 'not an article publish event' });
    }

    const { entry } = payload;

    if (!entry.slug || !entry.title) {
      return res.status(400).json({ error: 'Missing slug or title in payload' });
    }

    const article: Article = {
      id:          entry.id,
      slug:        entry.slug,
      title:       entry.title,
      description: entry.description ?? '',
      url:         `${config.blog.baseUrl}/${entry.slug}`,
      tags:        extractTags(entry),
      publishedAt: entry.publishedAt,
    };

    const job = await fanoutQueue.add(
      `fanout:${article.slug}`,
      { article },
      {
        jobId: `fanout:${article.slug}`,   // dedup — re-publishing same article is a no-op
        delay: config.blog.parkDelayMs,    // park until Vercel deploy webhook promotes this
      }
    );

    console.log(
      `[strapi] parked fanout job "${job.id}" for "${article.slug}" ` +
      `(safety-net fires in ${config.blog.parkDelayMs / 3600_000}h if Vercel webhook never arrives)`
    );

    return res.json({ parked: true, jobId: job.id });
  });

  // ── Vercel: deployment succeeded → promote parked jobs ───────────────────
  //
  // Vercel sends this when a deployment reaches READY state.
  // We only act on production deployments for the blog project.
  // On match: promote all DELAYED fanout jobs to run immediately.

  app.post('/webhook/vercel-deploy', async (req, res) => {
    const sig = req.headers['x-vercel-signature'] as string | undefined;
    const raw = (req as RawRequest).rawBody;

    if (sig && !verifyVercelSig(raw, sig)) {
      return res.status(401).json({ error: 'Invalid Vercel signature' });
    }

    const body = req.body as VercelWebhookPayload;

    // Only react to successful production deployments
    if (body.type !== 'deployment.succeeded') {
      return res.json({ ignored: true, reason: `event type is "${body.type}"` });
    }

    if (body.payload.target !== 'production') {
      return res.json({ ignored: true, reason: `target is "${body.payload.target}" (not production)` });
    }

    // Optionally restrict to the blog project
    const expectedProjectId = config.vercel.blogProjectId;
    if (expectedProjectId && body.payload.project.id !== expectedProjectId) {
      return res.json({
        ignored: true,
        reason: `project "${body.payload.project.id}" is not the blog project`,
      });
    }

    const promoted = await promotePendingJobs();

    console.log(
      `[vercel] deployment ${body.payload.deployment.id} succeeded — ` +
      `promoted ${promoted} parked fanout job(s) to run immediately`
    );

    return res.json({ promoted });
  });

  return app;
}
