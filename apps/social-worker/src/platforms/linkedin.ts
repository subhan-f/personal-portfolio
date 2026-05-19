import { config } from '../config.js';
import { linkedinPost } from '../content.js';
import type { Article } from '../types.js';

const BASE = 'https://api.linkedin.com/v2';

export async function postToLinkedIn(article: Article): Promise<void> {
  const token = config.linkedin.accessToken();
  const author = config.linkedin.personUrn();
  const text = linkedinPost(article);

  const body = {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'ARTICLE',
        media: [
          {
            status: 'READY',
            description: { text: article.description.slice(0, 256) },
            originalUrl: article.url,
            title: { text: article.title.slice(0, 200) },
          },
        ],
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await fetch(`${BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn API ${res.status}: ${err}`);
  }
}
