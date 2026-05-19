import { getSingletonHighlighter } from 'shiki';
import { Marked, Lexer } from 'marked';
import type { StrapiBlock } from '@lib/strapi';

// ─── Shiki singleton ──────────────────────────────────────────────────────────

let highlighterPromise: ReturnType<typeof getSingletonHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'javascript', 'typescript', 'tsx', 'jsx',
        'bash', 'sh', 'json', 'jsonc',
        'html', 'css', 'scss',
        'python', 'rust', 'go', 'sql',
        'yaml', 'toml', 'mdx', 'markdown',
        'diff', 'plaintext',
      ],
    });
  }
  return highlighterPromise;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractHeadings(markdown: string): TocHeading[] {
  const tokens = Lexer.lex(markdown);
  return tokens
    .filter(
      (t): t is { type: 'heading'; depth: number; text: string; raw: string; tokens: any[] } =>
        t.type === 'heading' && (t.depth === 2 || t.depth === 3)
    )
    .map((t) => ({
      id: slugifyHeading(t.text),
      text: t.text,
      level: t.depth as 2 | 3,
    }));
}

export function calcReadingTime(blocks: StrapiBlock[] = []): number {
  const text = blocks
    .filter((b) => b.__component === 'shared.rich-text')
    .map((b) => (b as Extract<StrapiBlock, { __component: 'shared.rich-text' }>).body ?? '')
    .join(' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function renderMarkdown(body: string): Promise<string> {
  const hl = await getHighlighter();
  const loadedLangs = hl.getLoadedLanguages() as string[];

  const localMarked = new Marked({
    renderer: {
      code({ text, lang }: { text: string; lang?: string }): string {
        const finalLang = lang && loadedLangs.includes(lang) ? lang : 'plaintext';
        try {
          const highlighted = hl.codeToHtml(text, {
            lang: finalLang,
            themes: { light: 'github-light', dark: 'github-dark' },
          });
          // Wrap in a positioned container so the copy button can be placed absolutely
          return `<div class="code-block relative group not-prose my-6">${highlighted}</div>`;
        } catch {
          return `<div class="code-block relative group not-prose my-6"><pre class="shiki"><code>${escapeHtml(text)}</code></pre></div>`;
        }
      },
      heading({ text, depth }: { text: string; depth: number; tokens?: any[] }): string {
        const id = slugifyHeading(text);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
    },
  });

  return localMarked.parse(body) as string;
}
