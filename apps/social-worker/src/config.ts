function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

function optional(key: string): string {
  return process.env[key] ?? '';
}

export const config = {
  redis: {
    url: optional('REDIS_URL') || 'redis://localhost:6379',
  },
  server: {
    port: Number(optional('PORT') || 3100),
    webhookSecret: optional('WEBHOOK_SECRET'),
  },
  blog: {
    baseUrl: optional('BLOG_BASE_URL') || 'https://subhanfarrakh.com/blog',
    // Safety-net delay on parked fanout jobs (ms). If the Vercel webhook never
    // fires (e.g. worker was down), the job still runs eventually. Default: 24h.
    parkDelayMs: Number(optional('PARK_DELAY_MS') || 24 * 60 * 60 * 1000),
  },
  vercel: {
    // Secret set in Vercel project → Settings → Webhooks.
    // Used to verify the X-Vercel-Signature header (HMAC-SHA1).
    webhookSecret: optional('VERCEL_WEBHOOK_SECRET'),
    // Restrict promotions to this Vercel project ID (the blog).
    // Leave blank to accept any project's deploy webhook.
    blogProjectId: optional('VERCEL_BLOG_PROJECT_ID') || 'prj_LyvMIZpMSlxPLrC55lbXpcMEpIA0',
  },

  // Per-platform credentials — only loaded when the worker for that platform starts
  linkedin: {
    accessToken: () => required('LINKEDIN_ACCESS_TOKEN'),
    personUrn: () => required('LINKEDIN_PERSON_URN'), // urn:li:person:XXXXXX
  },
  twitter: {
    apiKey: () => required('TWITTER_API_KEY'),
    apiSecret: () => required('TWITTER_API_SECRET'),
    accessToken: () => required('TWITTER_ACCESS_TOKEN'),
    accessSecret: () => required('TWITTER_ACCESS_SECRET'),
  },
  bluesky: {
    identifier: () => required('BLUESKY_IDENTIFIER'), // user.bsky.social
    appPassword: () => required('BLUESKY_APP_PASSWORD'),
  },
  reddit: {
    clientId: () => required('REDDIT_CLIENT_ID'),
    clientSecret: () => required('REDDIT_CLIENT_SECRET'),
    username: () => required('REDDIT_USERNAME'),
    password: () => required('REDDIT_PASSWORD'),
    subreddit: () => optional('REDDIT_SUBREDDIT') || 'webdev',
  },
  hashnode: {
    apiKey: () => required('HASHNODE_API_KEY'),
    publicationId: () => required('HASHNODE_PUBLICATION_ID'),
  },

  // Which platforms are active — set to comma-separated list or "all"
  activePlatforms: (optional('ACTIVE_PLATFORMS') || 'bluesky,hashnode')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean),
};
