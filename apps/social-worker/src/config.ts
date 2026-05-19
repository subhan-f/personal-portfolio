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
    baseUrl: optional('BLOG_BASE_URL') || 'https://blog.subhanfarrakh.com',
    // How long to wait after the Strapi webhook before the fanout job runs.
    // Gives Vercel time to rebuild and deploy the blog. Default: 7 minutes.
    fanoutDelayMs: Number(optional('FANOUT_DELAY_MS') || 7 * 60 * 1000),
    // How many times to retry the liveness check before giving up. Default: 10.
    livenessRetries: Number(optional('LIVENESS_RETRIES') || 10),
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
