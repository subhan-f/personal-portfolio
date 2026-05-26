#!/usr/bin/env node
import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { setTimeout } from 'timers/promises';

const TOKEN_PATH = 'gsc-token.json';
const CREDENTIALS_PATH = 'credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/indexing']; // Indexing API scope

// Helper: get OAuth2 client with auto‑refresh
async function getAuthorizedClient() {
  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
  oAuth2Client.setCredentials(token);
  if (token.expiry_date && token.expiry_date <= Date.now()) {
    const { credentials: newCreds } = await oAuth2Client.refreshAccessToken();
    writeFileSync(TOKEN_PATH, JSON.stringify(newCreds));
    oAuth2Client.setCredentials(newCreds);
  }
  return oAuth2Client;
}

// Recursively extract all page URLs from a sitemap (handles index files)
async function extractAllUrls(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${sitemapUrl}`);
  const text = await res.text();

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
    return urls.filter((u) => !u.includes('sitemap')); // skip any sitemap.xml
  }
}

// Submit a single URL to Google Indexing API
async function requestIndexing(url: string, authClient: any) {
  const indexing = google.indexing({ version: 'v3', auth: authClient });
  try {
    await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });
    console.log(`✅ ${url}`);
  } catch (err: any) {
    console.error(`❌ ${url}: ${err.message}`);
  }
}

async function main() {
  const auth = await getAuthorizedClient();

  const sitemapConfigs = [
    { host: 'subhanfarrakh.com', sitemap: 'https://subhanfarrakh.com/sitemap-index.xml' },
    { host: 'subhanfarrakh.com', sitemap: 'https://subhanfarrakh.com/blog/sitemap-index.xml' },
  ];

  let allUrls: string[] = [];
  for (const cfg of sitemapConfigs) {
    console.log(`\n📂 Processing ${cfg.host}`);
    const urls = await extractAllUrls(cfg.sitemap);
    console.log(`Found ${urls.length} page URLs`);
    allUrls.push(...urls);
  }

  console.log(`\n🚀 Submitting ${allUrls.length} URLs to Google Indexing API...`);
  for (const url of allUrls) {
    await requestIndexing(url, auth);
    await setTimeout(500); // respect rate limit (200 per minute → 1 per 300ms is safe)
  }
  console.log('\n✅ Done.');
}

main().catch(console.error);
