import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';

const TOKEN_PATH = 'gsc-token.json';
const CREDENTIALS_PATH = 'credentials.json';

async function getAuthClient() {
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

async function requestIndexingViaAPI(url: string, auth: any) {
  const indexing = google.indexing({ version: 'v3', auth });
  try {
    const res = await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    });
    console.log(`✅ ${url}`);
    return res;
  } catch (err: any) {
    console.error(`❌ ${url}: ${err.message}`);
  }
}

const urls: string[] = [
  'https://subhanfarrakh.com/blog/',
  'https://subhanfarrakh.com/about/',
  'https://subhanfarrakh.com/contact/',
  'https://subhanfarrakh.com/experience/',
  'https://subhanfarrakh.com/experience/allstate-mapping/',
  'https://subhanfarrakh.com/experience/kidskulturspass-exp/',
  'https://subhanfarrakh.com/experience/odd-jobs-on-demand/',
  'https://subhanfarrakh.com/faq/',
  'https://subhanfarrakh.com/privacy-policy/',
  'https://subhanfarrakh.com/projects/',
  'https://subhanfarrakh.com/projects/jorh/',
  'https://subhanfarrakh.com/projects/kidskulturspass/',
  'https://subhanfarrakh.com/projects/video-motion-magnification/',
  'https://subhanfarrakh.com/services/ai-agents/',
  'https://subhanfarrakh.com/services/ai-automation/',
  'https://subhanfarrakh.com/services/web-development/',
  'https://subhanfarrakh.com/skills/',
  'https://subhanfarrakh.com/terms/',
  'https://subhanfarrakh.com/testimonials/',
];

async function main() {
  const auth = await getAuthClient();
  for (const url of urls) {
    const res = await requestIndexingViaAPI(url, auth);
    console.log(res);
    await new Promise((r) => setTimeout(r, 500));
  }
}
main();
