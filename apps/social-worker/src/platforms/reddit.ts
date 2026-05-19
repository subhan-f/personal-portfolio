import { config } from '../config.js';
import { redditPost } from '../content.js';
import type { Article } from '../types.js';

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret, username, password } = {
    clientId: config.reddit.clientId(),
    clientSecret: config.reddit.clientSecret(),
    username: config.reddit.username(),
    password: config.reddit.password(),
  };

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
  });

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'social-worker/1.0 by subhanfarrakh',
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Reddit auth ${res.status}: ${err}`);
  }

  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function postToReddit(article: Article): Promise<void> {
  const token = await getAccessToken();
  const { title, text } = redditPost(article);
  const subreddit = config.reddit.subreddit();

  const body = new URLSearchParams({
    api_type: 'json',
    kind: 'self',
    sr: subreddit,
    title,
    text,
    resubmit: 'true',
    nsfw: 'false',
    spoiler: 'false',
  });

  const res = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'social-worker/1.0 by subhanfarrakh',
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Reddit submit ${res.status}: ${err}`);
  }

  const json = (await res.json()) as { json: { errors: string[][] } };
  if (json.json.errors.length > 0) {
    throw new Error(`Reddit errors: ${JSON.stringify(json.json.errors)}`);
  }
}
