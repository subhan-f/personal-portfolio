const BASE = (import.meta.env.STRAPI_URL ?? 'http://localhost:1337').replace(/\/$/, '');

export function getStrapiMedia(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}

export async function fetchStrapi<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`/api${path}`, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${path}`);
  return res.json();
}

// ─── Response wrappers ────────────────────────────────────────────────────────

export interface StrapiList<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

// ─── Media ────────────────────────────────────────────────────────────────────

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface StrapiAuthor {
  id: number;
  documentId: string;
  name: string;
  avatar?: StrapiMedia | null;
}

export interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export type StrapiBlock =
  | { __component: 'shared.rich-text'; id: number; body: string }
  | { __component: 'shared.media'; id: number; file: StrapiMedia }
  | { __component: 'shared.quote'; id: number; title?: string; body: string }
  | { __component: 'shared.slider'; id: number; files: StrapiMedia[] };

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

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface StrapiProject {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  client?: string | null;
  year: string;
  role: string;
  technologies: string[];
  features: string[];
  challenges?: string | null;
  solution?: string | null;
  outcome?: string | null;
  link?: string | null;
  image?: StrapiMedia | null;
  gallery?: StrapiMedia[] | null;
  bgColor: string;
  publishedAt?: string;
  updatedAt?: string;
}

// ─── Experience ───────────────────────────────────────────────────────────────

export interface StrapiExperience {
  id: number;
  documentId: string;
  slug: string;
  role: string;
  company: string;
  location?: string | null;
  duration: string;
  shortDescription: string;
  fullDescription: string;
  achievements: string[];
  technologies: string[];
  image?: StrapiMedia | null;
  publishedAt?: string;
  updatedAt?: string;
}

// ─── Testimonial ──────────────────────────────────────────────────────────────

export interface StrapiTestimonial {
  id: number;
  documentId: string;
  name: string;
  role: string;
  review: string;
  image?: StrapiMedia | null;
}
