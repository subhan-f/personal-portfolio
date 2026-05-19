export interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  publishedAt: string;
  contentMarkdown?: string; // used for Hashnode crosspost
}

export type Platform = 'linkedin' | 'twitter' | 'bluesky' | 'reddit' | 'hashnode';

export interface FanoutJob {
  article: Article;
}

export interface PlatformJob {
  platform: Platform;
  article: Article;
}

// Strapi v4/v5 webhook payload shape
export interface StrapiWebhookPayload {
  event: string;
  model: string;
  entry: {
    id: number;
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    tags?: Array<{ name: string } | string>;
    blocks?: unknown[];
  };
}
