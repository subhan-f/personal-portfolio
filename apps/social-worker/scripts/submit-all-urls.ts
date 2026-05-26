#!/usr/bin/env node
import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { setTimeout } from 'timers/promises';

const TOKEN_PATH = 'gsc-token.json';
const CREDENTIALS_PATH = 'credentials.json';
const SITE_URL = 'sc-domain:subhanfarrakh.com'; // or 'https://subhanfarrakh.com'

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

async function fetchXml(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function extractUrlsFromSitemap(sitemapUrl: string): Promise<string[]> {
  const text = await fetchXml(sitemapUrl);
  // Check if it's a sitemap index (contains <sitemap><loc>)
  if (text.includes('<sitemapindex')) {
    const childUrls = [...text.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const allUrls: string[] = [];
    for (const childUrl of childUrls) {
      console.log(`  ↳ Recursing into ${childUrl}`);
      const childPageUrls = await extractUrlsFromSitemap(childUrl);
      allUrls.push(...childPageUrls);
    }
    return allUrls;
  } else {
    // Regular sitemap - extract page URLs
    const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    // Filter out sitemap files themselves (just in case)
    return urls.filter((u) => !u.includes('sitemap'));
  }
}

async function requestIndexing(url: string, authClient: any) {
  const searchConsole = google.searchconsole({ version: 'v1', auth: authClient });
  try {
    await searchConsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: url,
        siteUrl: SITE_URL,
      },
    });
    console.log(`✅ ${url}`);
  } catch (err: any) {
    console.error(`❌ ${url}:`, err.message);
  }
}

async function main() {
  const auth = await getAuthorizedClient();
  const sitemapIndexes = [
    'https://subhanfarrakh.com/sitemap-index.xml',
    'https://subhanfarrakh.com/blog/sitemap-index.xml',
  ];

  let allPageUrls: string[] = [];
  for (const idxUrl of sitemapIndexes) {
    console.log(`\n📂 Processing sitemap index: ${idxUrl}`);
    const pageUrls = await extractUrlsFromSitemap(idxUrl);
    console.log(`Found ${pageUrls.length} page URLs`);
    allPageUrls.push(...pageUrls);
  }

  console.log(`\n🚀 Submitting ${allPageUrls.length} total URLs to Google...`);
  for (const url of allPageUrls) {
    await requestIndexing(url, auth);
    await setTimeout(500); // rate limit safety
  }
  console.log('\n✅ All pages submitted.');
}

main().catch(console.error);
