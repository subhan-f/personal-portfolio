import { config } from '../config.js';
import { blueskyPost } from '../content.js';
import type { Article } from '../types.js';

const PDS = 'https://bsky.social/xrpc';

interface Session {
  accessJwt: string;
  did: string;
}

async function createSession(): Promise<Session> {
  const res = await fetch(`${PDS}/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: config.bluesky.identifier(),
      password: config.bluesky.appPassword(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Bluesky auth ${res.status}: ${err}`);
  }

  return res.json() as Promise<Session>;
}

// Build a "facet" so the URL is clickable inside the post
function buildLinkFacet(text: string, url: string) {
  const encoder = new TextEncoder();
  const byteStart = encoder.encode(text.slice(0, text.indexOf(url))).length;
  const byteEnd = byteStart + encoder.encode(url).length;
  return {
    index: { byteStart, byteEnd },
    features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
  };
}

export async function postToBluesky(article: Article): Promise<void> {
  const session = await createSession();
  const { text, url } = blueskyPost(article);

  const record: Record<string, unknown> = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    facets: [buildLinkFacet(text, url)],
  };

  const res = await fetch(`${PDS}/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Bluesky post ${res.status}: ${err}`);
  }
}
