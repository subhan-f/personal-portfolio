#!/usr/bin/env node
import { setTimeout } from 'timers/promises';

const KEY = process.env.INDEXNOW_KEY || '9c9e141202417cabfc2cb395eb64b11d';
if (!KEY || KEY === 'your-key-here') {
  console.error('❌ Set INDEXNOW_KEY environment variable');
  process.exit(1);
}

const DOMAINS = [
  { host: 'subhanfarrakh.com', sitemap: 'https://subhanfarrakh.com/sitemap-index.xml' },
  { host: 'subhanfarrakh.com', sitemap: 'https://subhanfarrakh.com/blog/sitemap-index.xml' },
];

const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function extractAllUrls(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl);
  const text = await res.text();
  // If it's a sitemap index, recurse
  if (text.includes('<sitemapindex')) {
    const childUrls = [...text.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const all: string[] = [];
    for (const child of childUrls) {
      console.log(`  ↳ Recursing into ${child}`);
      const urls = await extractAllUrls(child);
      all.push(...urls);
    }
    return all;
  } else {
    const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    // Filter out any sitemap files themselves
    return urls.filter((u) => !u.includes('sitemap'));
  }
}

async function submitBatch(host: string, urls: string[]) {
  // Split into chunks of 10,000 (IndexNow limit)
  for (let i = 0; i < urls.length; i += 10000) {
    const chunk = urls.slice(i, i + 10000);
    const body = { host, key: KEY, urlList: chunk };
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      console.log(`✅ Submitted ${chunk.length} URLs for ${host}`);
    } else {
      console.error(`❌ Failed for ${host}: ${res.status} ${await res.text()}`);
    }
    await setTimeout(1000); // be polite
  }
}

async function main() {
  for (const domain of DOMAINS) {
    console.log(`\n📂 Processing ${domain.host}`);
    const urls = await extractAllUrls(domain.sitemap);
    console.log(`Found ${urls.length} page URLs`);
    await submitBatch(domain.host, urls);
  }
  console.log('\n✅ All URLs submitted to IndexNow (Google, Bing, Yandex)');
}

main().catch(console.error);
