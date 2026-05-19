import { Worker } from 'bullmq';
import { connection, platformQueues } from '../queues.js';
import { config } from '../config.js';
import type { FanoutJob, Platform } from '../types.js';

/**
 * Single liveness check — not a retry loop.
 * By the time this job runs, Vercel has already confirmed the deployment
 * succeeded, so the URL should be live. This is a fast sanity check only:
 * if it fails something is genuinely wrong (wrong URL, CDN issue), and we
 * want to fail loudly rather than silently post a broken link.
 */
async function assertLive(url: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(url, { method: 'HEAD' });
  } catch (err) {
    throw new Error(`Liveness check failed — network error for ${url}: ${String(err)}`);
  }
  if (!res.ok) {
    throw new Error(
      `Liveness check failed — ${url} returned ${res.status}. ` +
      `Vercel deploy succeeded but URL is not reachable. Check CDN propagation.`
    );
  }
}

/**
 * Fanout worker — single consumer of the "article:fanout" queue.
 *
 * Jobs arrive here in one of two ways:
 *  1. Promoted immediately by the Vercel deploy webhook (normal path).
 *  2. Safety-net: the 24h park delay expires with no Vercel webhook received.
 *
 * In both cases the worker verifies the URL is live, then fans out to one
 * job per active platform. Platform workers run independently from there.
 */
export function startFanoutWorker() {
  const worker = new Worker<FanoutJob>(
    'article:fanout',
    async (job) => {
      const { article } = job.data;
      const active = config.activePlatforms as Platform[];

      // Sanity check: URL must be reachable before we post anywhere
      await assertLive(article.url);

      console.log(`[fanout] "${article.title}" is live — fanning out to [${active.join(', ')}]`);

      await Promise.all(
        active.map((platform) =>
          platformQueues[platform].add(
            `${platform}:${article.slug}`,
            { platform, article },
            {
              // Dedup: re-triggering the same deploy never double-posts
              jobId: `${platform}:${article.slug}`,
            }
          )
        )
      );

      console.log(`[fanout] enqueued ${active.length} platform jobs for "${article.slug}"`);
    },
    { connection, concurrency: 1 }
  );

  worker.on('failed', (job, err) => {
    console.error(
      `[fanout] job "${job?.id}" failed (attempt ${job?.attemptsMade}/${job?.opts.attempts}): ${err.message}`
    );
  });

  return worker;
}
