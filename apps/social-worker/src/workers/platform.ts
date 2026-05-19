import { Worker } from 'bullmq';
import { connection } from '../queues.js';
import { postToLinkedIn } from '../platforms/linkedin.js';
import { postToTwitter } from '../platforms/twitter.js';
import { postToBluesky } from '../platforms/bluesky.js';
import { postToReddit } from '../platforms/reddit.js';
import { postToHashnode } from '../platforms/hashnode.js';
import type { Platform, PlatformJob } from '../types.js';

const handlers: Record<Platform, (article: PlatformJob['article']) => Promise<void>> = {
  linkedin: postToLinkedIn,
  twitter:  postToTwitter,
  bluesky:  postToBluesky,
  reddit:   postToReddit,
  hashnode: postToHashnode,
};

/**
 * Creates one Worker per platform queue.
 * Each worker is independent: a Twitter failure never delays a Bluesky post.
 *
 * Concurrency is 1 per platform — platforms like Twitter are rate-sensitive
 * and serial posting (thread order) is required.
 */
export function startPlatformWorkers(platforms: Platform[]) {
  return platforms.map((platform) => {
    const worker = new Worker<PlatformJob>(
      `platform:${platform}`,
      async (job) => {
        const { article } = job.data;
        console.log(`[${platform}] posting "${article.title}"…`);
        await handlers[platform](article);
        console.log(`[${platform}] ✓ posted "${article.slug}"`);
      },
      {
        connection,
        concurrency: 1,
        limiter: {
          // Max 1 job per 10s per worker — conservative default, override per platform if needed
          max: 1,
          duration: 10_000,
        },
      }
    );

    worker.on('failed', (job, err) => {
      console.error(`[${platform}] job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
    });

    worker.on('completed', (job) => {
      console.log(`[${platform}] job ${job.id} completed`);
    });

    return worker;
  });
}
