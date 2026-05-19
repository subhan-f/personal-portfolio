import { config } from '../config.js';
import { hashnodeCrosspost } from '../content.js';
import type { Article } from '../types.js';

const GQL = 'https://gql.hashnode.com';

const PUBLISH_MUTATION = `
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        url
        slug
      }
    }
  }
`;

export async function postToHashnode(article: Article): Promise<void> {
  const { title, contentMarkdown, tags } = hashnodeCrosspost(article);

  const input = {
    title,
    contentMarkdown,
    publicationId: config.hashnode.publicationId(),
    tags: tags.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })),
    originalArticleURL: article.url,
    settings: {
      enableTableOfContent: true,
      isNewsletterActivated: true,
    },
  };

  const res = await fetch(GQL, {
    method: 'POST',
    headers: {
      Authorization: config.hashnode.apiKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: PUBLISH_MUTATION, variables: { input } }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Hashnode API ${res.status}: ${err}`);
  }

  const json = (await res.json()) as { errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error(`Hashnode GQL errors: ${json.errors.map((e) => e.message).join(', ')}`);
  }
}
