import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import * as readline from 'readline';
import { exec } from 'child_process';

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/indexing',
];
const TOKEN_PATH = 'gsc-token.json';
const CREDENTIALS_PATH = 'credentials.json';

async function loadCredentials() {
  const content = readFileSync(CREDENTIALS_PATH, 'utf8');
  return JSON.parse(content).installed || JSON.parse(content);
}

async function getAccessToken(oAuth2Client: any) {
  const tokenFile = readFileSync(TOKEN_PATH, 'utf8');
  const token = JSON.parse(tokenFile);
  oAuth2Client.setCredentials(token);
  if (token.expiry_date && token.expiry_date <= Date.now()) {
    const { credentials } = await oAuth2Client.refreshAccessToken();
    writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
    console.log('✅ Refresh token stored in', TOKEN_PATH);
  }
  return oAuth2Client;
}

async function main() {
  const credentials = await loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    const { tokens } = await oAuth2Client.getToken(code);
    writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('✅ Refresh token saved to', TOKEN_PATH);
  });
}

main().catch(console.error);
