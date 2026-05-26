#!/usr/bin/env node
import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { setTimeout } from 'timers/promises';

const TOKEN_PATH = 'gsc-token.json';
const CREDENTIALS_PATH = 'credentials.json';
const SITE_URL_PREFIX = 'sc-domain:subhanfarrakh.com';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

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
    return urls.filter((u) => !u.includes('sitemap'));
  }
}

function getSiteUrlForPage(_pageUrl: string): string {
  return SITE_URL_PREFIX;
}

async function inspectUrl(url: string, authClient: any) {
  const searchConsole = google.searchconsole({ version: 'v1', auth: authClient });
  const siteUrl = getSiteUrlForPage(url);
  try {
    const response = await searchConsole.urlInspection.index.inspect({
      requestBody: { inspectionUrl: url, siteUrl: siteUrl },
    });
    const data: any = response.data;
    const indexStatusResult = data.inspectionResult?.indexStatusResult || {};
    const inspectionResultLink = data.inspectionResult?.inspectionResultLink || '';
    const coverageState = indexStatusResult.coverageState || 'unknown';
    const verdict = indexStatusResult.verdict || '';
    const lastCrawl = indexStatusResult.lastCrawlTime || '';
    const pageFetchState = indexStatusResult.pageFetchState || '';
    return {
      url,
      siteUrl,
      coverageState,
      verdict,
      lastCrawl,
      pageFetchState,
      inspectionResultLink,
      error: null,
    };
  } catch (err: any) {
    return {
      url,
      siteUrl,
      coverageState: 'error',
      verdict: '',
      lastCrawl: '',
      pageFetchState: '',
      inspectionResultLink: '',
      error: err.message,
    };
  }
}

function summarizeCoverageState(state: string): string {
  if (state.includes('Submitted and indexed')) return 'INDEXED';
  if (state.includes('Redirect error')) return 'REDIRECT_ERROR';
  if (state.includes('Discovered - currently not indexed')) return 'DISCOVERED_NOT_INDEXED';
  if (state.includes('URL is unknown to Google')) return 'UNKNOWN';
  return state;
}

async function main() {
  const auth = await getAuthorizedClient();

  const sitemapConfigs = [
    { host: 'subhanfarrakh.com', sitemap: 'https://subhanfarrakh.com/sitemap-index.xml' },
    { host: 'subhanfarrakh.com', sitemap: 'https://subhanfarrakh.com/blog/sitemap-index.xml' },
  ];

  let allUrls: string[] = [];
  for (const cfg of sitemapConfigs) {
    console.log(`\n📂 Extracting URLs from ${cfg.host}`);
    const urls = await extractAllUrls(cfg.sitemap);
    console.log(`   Found ${urls.length} URLs`);
    allUrls.push(...urls);
  }

  const report: any[] = [];
  console.log(`\n🔍 Checking indexing status for ${allUrls.length} URLs...`);

  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i];
    process.stdout.write(`  ${i + 1}/${allUrls.length} ${url} ... `);
    const result = await inspectUrl(url, auth);
    if (result.error) {
      console.log(`⚠️ API error: ${result.error}`);
    } else {
      const shortState = summarizeCoverageState(result.coverageState);
      if (shortState === 'INDEXED') {
        console.log(`✅ indexed`);
      } else if (shortState === 'DISCOVERED_NOT_INDEXED') {
        console.log(`❌ discovered but not indexed`);
      } else if (shortState === 'REDIRECT_ERROR') {
        console.log(`⚠️ redirect error`);
      } else if (shortState === 'UNKNOWN') {
        console.log(`❓ unknown to Google`);
      } else {
        console.log(`❓ ${result.coverageState}`);
      }
    }
    report.push(result);
    await setTimeout(300);
  }

  // Save CSV report
  const csvRows = [
    ['url', 'site', 'coverage_state', 'verdict', 'last_crawl', 'page_fetch_state', 'error'],
  ];
  for (const r of report) {
    csvRows.push([
      r.url,
      r.siteUrl,
      r.coverageState,
      r.verdict,
      r.lastCrawl,
      r.pageFetchState,
      r.error || '',
    ]);
  }
  const csvContent = csvRows.map((row) => row.join(',')).join('\n');
  writeFileSync('index-status-report.csv', csvContent);
  console.log(`\n📊 Full report saved to index-status-report.csv`);

  const notIndexed = report.filter(
    (r) =>
      r.coverageState === 'Discovered - currently not indexed' ||
      r.coverageState === 'URL is unknown to Google' ||
      r.coverageState === 'Redirect error'
  );
  if (notIndexed.length > 0) {
    console.log(`\n⚠️ ${notIndexed.length} URLs are NOT indexed.`);
    console.log(`You can manually request indexing in GSC or re-submit them via IndexNow:`);
    notIndexed.forEach((r) => console.log(`   ${r.url}`));
  } else {
    console.log(`\n🎉 All URLs appear to be indexed!`);
  }
}

main().catch(console.error);
