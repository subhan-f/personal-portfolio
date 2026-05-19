import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from './config.js';
import type { Platform, FanoutJob, PlatformJob } from './types.js';

export const connection = new Redis(config.redis.url, {
  maxRetriesPerRequest: null, // required by BullMQ
});

// One fanout queue — receives raw article events
export const fanoutQueue = new Queue<FanoutJob>('article:fanout', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// One queue per platform — each worker consumes independently
export const PLATFORMS: Platform[] = ['linkedin', 'twitter', 'bluesky', 'reddit', 'hashnode'];

export const platformQueues: Record<Platform, Queue<PlatformJob>> = Object.fromEntries(
  PLATFORMS.map((p) => [
    p,
    new Queue<PlatformJob>(`platform:${p}`, {
      connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 10_000 },
        removeOnComplete: 50,
        removeOnFail: 200,
      },
    }),
  ])
) as Record<Platform, Queue<PlatformJob>>;
