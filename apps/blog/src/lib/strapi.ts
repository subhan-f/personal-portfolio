const BASE = (import.meta.env.STRAPI_URL ?? 'http://localhost:1337').replace(/\/$/, '');

export function getStrapiMedia(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}

export async function fetchStrapi<T>(
  path: string,
  params: Record<string, string> = {},
  options: RequestInit = {}
): Promise<T> {
  const url = new URL(`/api${path}`, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), options);
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${path}`);
  return res.json();
}

// ── Response wrappers ──────────────────────────────────────────────────────────

export interface StrapiList<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

// ── Media ──────────────────────────────────────────────────────────────────────

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
}

// ── Author ─────────────────────────────────────────────────────────────────────

export interface StrapiAuthor {
  id: number;
  documentId: string;
  name: string;
  avatar?: StrapiMedia | null;
}

// ── Category ───────────────────────────────────────────────────────────────────

export interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

// ── Blocks ─────────────────────────────────────────────────────────────────────

export type StrapiBlock =
  | { __component: 'shared.rich-text'; id: number; body: string }
  | { __component: 'shared.media'; id: number; file: StrapiMedia }
  | { __component: 'shared.quote'; id: number; title?: string; body: string }
  | { __component: 'shared.slider'; id: number; files: StrapiMedia[] };

// ── Article ────────────────────────────────────────────────────────────────────

export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  tags?: string[] | null;
  cover?: StrapiMedia | null;
  author?: StrapiAuthor | null;
  category?: StrapiCategory | null;
  blocks?: StrapiBlock[];
  publishedAt: string;
  updatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getArticleTags(post: StrapiArticle): string[] {
  return post.tags ?? (post.category ? [post.category.name] : []);
}

export function tagToSlug(tag: string): string {
  return tag.toLowerCase().replace(/[\s/]+/g, '-');
}
