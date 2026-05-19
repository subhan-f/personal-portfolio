import { createHmac, randomBytes } from 'crypto';
import { config } from '../config.js';
import { twitterThread } from '../content.js';
import type { Article } from '../types.js';

const TWEETS_URL = 'https://api.twitter.com/2/tweets';

// ──────────────────────────────────────────────────────────────
// OAuth 1.0a signing — no extra dependencies
// ──────────────────────────────────────────────────────────────

function percentEncode(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function oauthHeader(method: string, url: string, apiKey: string, apiSecret: string, accessToken: string, accessSecret: string): string {
  const nonce = randomBytes(16).toString('hex');
  const ts = Math.floor(Date.now() / 1000).toString();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: ts,
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const paramString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
    .join('&');

  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(paramString)].join('&');
  const signingKey = `${percentEncode(apiSecret)}&${percentEncode(accessSecret)}`;
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams['oauth_signature'] = signature;

  const headerValue = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${percentEncode(k)}="${percentEncode(v)}"`)
    .join(', ');

  return `OAuth ${headerValue}`;
}

async function postTweet(text: string, replyToId?: string): Promise<string> {
  const { apiKey, apiSecret, accessToken, accessSecret } = {
    apiKey: config.twitter.apiKey(),
    apiSecret: config.twitter.apiSecret(),
    accessToken: config.twitter.accessToken(),
    accessSecret: config.twitter.accessSecret(),
  };

  const authorization = oauthHeader('POST', TWEETS_URL, apiKey, apiSecret, accessToken, accessSecret);
  const body: Record<string, unknown> = { text };
  if (replyToId) body['reply'] = { in_reply_to_tweet_id: replyToId };

  const res = await fetch(TWEETS_URL, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twitter API ${res.status}: ${err}`);
  }

  const json = (await res.json()) as { data: { id: string } };
  return json.data.id;
}

export async function postToTwitter(article: Article): Promise<void> {
  const tweets = twitterThread(article);
  let previousId: string | undefined;

  for (const text of tweets) {
    previousId = await postTweet(text, previousId);
    // Small delay between thread tweets to avoid rate-limit bursts
    await new Promise((r) => setTimeout(r, 1200));
  }
}
