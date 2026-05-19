import { Marked, Lexer } from 'marked';
import { getSingletonHighlighter } from 'shiki';
import type { StrapiBlock } from './strapi';

// ── Shiki singleton ────────────────────────────────────────────────────────────

let _hl: Awaited<ReturnType<typeof getSingletonHighlighter>> | null = null;

async function getHighlighter() {
  if (!_hl) {
    _hl = await getSingletonHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'tsx', 'jsx', 'astro', 'bash', 'shell',
              'json', 'html', 'css', 'scss', 'python', 'rust', 'go', 'sql',
              'yaml', 'toml', 'mdx', 'markdown', 'diff', 'plaintext'],
    });
  }
  return _hl;
}

// ── Slug helper ────────────────────────────────────────────────────────────────

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── TOC heading type ───────────────────────────────────────────────────────────

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

// ── Callout parser ─────────────────────────────────────────────────────────────

const CALLOUT_RE = /^:::(\w+)(?:\s+(.+))?\n([\s\S]*?):::$/gm;

function parseCallouts(body: string): string {
  return body.replace(CALLOUT_RE, (_, type, label, content) => {
    const variant = ['info', 'warning', 'danger', 'success'].includes(type) ? type : 'info';
    const title = label ?? ({ info: 'Note', warning: 'Warning', danger: 'Danger', success: 'Tip' } as Record<string, string>)[variant];
    const icon = ({ info: '💡', warning: '⚠️', danger: '🚨', success: '✅' } as Record<string, string>)[variant];
    return `<div class="callout callout-${variant}" data-label="${title}" data-icon="${icon}">\n\n${content.trim()}\n\n</div>`;
  });
}

// ── HTML escape ────────────────────────────────────────────────────────────────

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── renderMarkdown ─────────────────────────────────────────────────────────────

export async function renderMarkdown(body: string): Promise<string> {
  const hl = await getHighlighter();
  const loadedLangs = hl.getLoadedLanguages() as string[];

  const localMarked = new Marked({
    renderer: {
      code({ text, lang }) {
        // Support title annotation: ```ts title="file.ts"
        let title = '';
        let cleanLang = lang ?? '';
        const titleMatch = cleanLang.match(/^(\w+)\s+title="([^"]+)"$/);
        if (titleMatch) {
          cleanLang = titleMatch[1];
          title = titleMatch[2];
        }

        const finalLang = cleanLang && loadedLangs.includes(cleanLang) ? cleanLang : 'plaintext';

        let highlighted: string;
        try {
          highlighted = hl.codeToHtml(text, {
            lang: finalLang,
            theme: 'github-dark',
          });
        } catch {
          highlighted = `<pre class="shiki"><code>${escapeHtml(text)}</code></pre>`;
        }

        const headerLeft = title
          ? `<span class="code-block-title">${escapeHtml(title)}</span>`
          : '';
        const langBadge = `<span class="code-block-lang">${finalLang}</span>`;

        return `
<div class="code-block not-prose my-6">
  <div class="code-block-header">
    <div class="flex items-center gap-3">${langBadge}${headerLeft}</div>
    <button class="copy-btn" aria-label="Copy code">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      <span>Copy</span>
    </button>
  </div>
  ${highlighted}
</div>`;
      },

      heading({ text, depth }) {
        const id = slugifyHeading(text);
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },

      blockquote({ text }) {
        // Handle callout divs injected by parseCallouts
        if (text.trimStart().startsWith('<div class="callout')) return text;
        return `<blockquote>${text}</blockquote>`;
      },
    },
  });

  const processed = parseCallouts(body);
  return localMarked.parse(processed) as string;
}

// ── extractHeadings ────────────────────────────────────────────────────────────

export function extractHeadings(markdown: string): TocHeading[] {
  const tokens = Lexer.lex(markdown);
  return tokens
    .filter((t): t is Extract<typeof t, { type: 'heading' }> =>
      t.type === 'heading' && (t.depth === 2 || t.depth === 3)
    )
    .map((t) => ({
      id: slugifyHeading(t.text),
      text: t.text,
      level: t.depth as 2 | 3,
    }));
}

// ── calcReadingTime ────────────────────────────────────────────────────────────

export function calcReadingTime(blocks: StrapiBlock[] = []): number {
  const text = blocks
    .filter((b) => b.__component === 'shared.rich-text')
    .map((b) => (b as Extract<typeof b, { __component: 'shared.rich-text' }>).body ?? '')
    .join(' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
