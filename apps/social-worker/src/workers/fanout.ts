import { Worker } from 'bullmq';
import { connection, platformQueues } from '../queues.js';
import { config } from '../config.js';
import type { FanoutJob, Platform } from '../types.js';

/**
 * Poll article.url with HEAD requests until it returns HTTP 200.
 * Throws if the URL is still not live after maxAttempts — BullMQ will
 * then retry the whole fanout job with exponential backoff.
 */
async function assertLive(url: string, maxAttempts: number): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) {
        console.log(`[fanout] liveness check passed (attempt ${attempt}): ${url}`);
        return;
      }
      console.warn(`[fanout] liveness check ${attempt}/${maxAttempts}: ${url} → ${res.status}`);
    } catch (err) {
      console.warn(`[fanout] liveness check ${attempt}/${maxAttempts}: network error — ${String(err)}`);
    }

    if (attempt < maxAttempts) {
      // Linear back-off: 15s, 30s, 45s… between attempts within the same job run
      await new Promise((r) => setTimeout(r, attempt * 15_000));
    }
  }

  // Exhausted in-job retries — throw so BullMQ retries the whole job later
  throw new Error(`Blog URL not live after ${maxAttempts} checks: ${url}`);
}

/**
 * Fanout worker — single consumer of the "article:fanout" queue.
 *
 * Flow:
 *  1. Job is delayed by FANOUT_DELAY_MS (default 7 min) at enqueue time,
 *     giving Vercel time to rebuild the blog from Strapi.
 *  2. When the job runs, we verify the URL is actually reachable before
 *     fanning out — guards against slow deploys.
 *  3. On success, one job per active platform is enqueued.
 */
export function startFanoutWorker() {
  const worker = new Worker<FanoutJob>(
    'article:fanout',
    async (job) => {
      const { article } = job.data;
      const active = config.activePlatforms as Platform[];

      // Guard: verify the blog post URL is live before posting anywhere
      await assertLive(article.url, config.blog.livenessRetries);

      console.log(`[fanout] "${article.title}" is live — fanning out to [${active.join(', ')}]`);

      await Promise.all(
        active.map((platform) =>
          platformQueues[platform].add(
            `${platform}:${article.slug}`,
            { platform, article },
            { jobId: `${platform}:${article.slug}` }
          )
        )
      );

      console.log(`[fanout] enqueued ${active.length} platform jobs for "${article.slug}"`);
    },
    { connection, concurrency: 1 }
  );

  worker.on('failed', (job, err) => {
    console.error(`[fanout] job ${job?.id} failed (attempt ${job?.attemptsMade}/${job?.opts.attempts}):`, err.message);
  });

  return worker;
}
