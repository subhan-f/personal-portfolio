import { Worker } from 'bullmq';
import { connection, platformQueues } from '../queues.js';
import { config } from '../config.js';
import type { FanoutJob, Platform } from '../types.js';

/**
 * Fanout worker — single consumer of the "article:fanout" queue.
 * For each article event it fans out by enqueuing one job per active platform.
 * Platform workers then process their queues independently.
 */
export function startFanoutWorker() {
  const worker = new Worker<FanoutJob>(
    'article:fanout',
    async (job) => {
      const { article } = job.data;
      const active = config.activePlatforms as Platform[];

      console.log(`[fanout] article "${article.title}" → fanning out to [${active.join(', ')}]`);

      await Promise.all(
        active.map((platform) =>
          platformQueues[platform].add(
            `${platform}:${article.slug}`,
            { platform, article },
            {
              // Deduplicate: if the same article is already queued for this platform, skip
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
    console.error(`[fanout] job ${job?.id} failed:`, err.message);
  });

  return worker;
}
