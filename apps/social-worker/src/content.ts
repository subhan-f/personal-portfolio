import type { Article, Platform } from './types.js';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function hashtags(tags: string[], max = 5): string {
  return tags
    .slice(0, max)
    .map((t) => `#${t.replace(/\s+/g, '').replace(/-/g, '')}`)
    .join(' ');
}

function truncate(text: string, max: number, ellipsis = '…'): string {
  if (text.length <= max) return text;
  return text.slice(0, max - ellipsis.length).trimEnd() + ellipsis;
}

// Split description into natural tweet-sized chunks (<260 chars each)
function splitIntoChunks(text: string, maxLen = 260): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if (!current) { current = s; continue; }
    if (current.length + 1 + s.length <= maxLen) {
      current += ' ' + s;
    } else {
      chunks.push(current);
      current = s;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// ──────────────────────────────────────────────────────────────
// Platform content generators
// ──────────────────────────────────────────────────────────────

export function linkedinPost(article: Article): string {
  const tags = hashtags(article.tags, 5);
  return [
    article.title,
    '',
    article.description,
    '',
    `Read the full article →`,
    article.url,
    '',
    tags,
  ]
    .join('\n')
    .trim();
}

/** Returns an array of tweet strings to post as a thread. */
export function twitterThread(article: Article): string[] {
  const thread: string[] = [];

  // Hook tweet
  thread.push(`${truncate(article.title, 200)}\n\nA quick thread 🧵`);

  // Body tweets — one chunk each
  const chunks = splitIntoChunks(article.description, 250);
  thread.push(...chunks);

  // CTA tweet
  thread.push(`Full article → ${article.url}\n\n${hashtags(article.tags, 3)}`);

  return thread;
}

export function blueskyPost(article: Article): { text: string; url: string } {
  const body = truncate(article.description, 220);
  return {
    text: `${truncate(article.title, 60)}\n\n${body}\n\n${hashtags(article.tags, 3)}`,
    url: article.url,
  };
}

export function redditPost(article: Article): { title: string; text: string } {
  return {
    title: article.title,
    text: `${article.description}\n\n---\n\nFull article: ${article.url}`,
  };
}

// Hashnode receives the full article so no truncation needed
export function hashnodeCrosspost(article: Article): {
  title: string;
  contentMarkdown: string;
  tags: string[];
} {
  return {
    title: article.title,
    contentMarkdown:
      article.contentMarkdown ??
      `${article.description}\n\n[Read the full post on my blog](${article.url})`,
    tags: article.tags.slice(0, 5),
  };
}

// ──────────────────────────────────────────────────────────────
// Dispatcher
// ──────────────────────────────────────────────────────────────

export function buildContent(platform: Platform, article: Article) {
  switch (platform) {
    case 'linkedin': return linkedinPost(article);
    case 'twitter':  return twitterThread(article);
    case 'bluesky':  return blueskyPost(article);
    case 'reddit':   return redditPost(article);
    case 'hashnode': return hashnodeCrosspost(article);
  }
}
