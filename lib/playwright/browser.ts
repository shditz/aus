import { chromium, Browser, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const SESSION_PATH = path.join(process.cwd(), 'storage', 'session', 'session.json');
const DOWNLOADS_PATH = path.join(process.cwd(), 'storage', 'downloads');

export async function launchBrowser(): Promise<Browser> {
  const headless = process.env.BROWSER_HEADLESS === 'true';
  
  return await chromium.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });
}

export async function createContext(browser: Browser): Promise<BrowserContext> {
  const contextOptions: Parameters<Browser['newContext']>[0] = {
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    acceptDownloads: true,
  };

  if (fs.existsSync(SESSION_PATH)) {
    try {
      contextOptions.storageState = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf-8'));
    } catch {}
  }

  return await browser.newContext(contextOptions);
}

export async function saveSession(context: BrowserContext): Promise<void> {
  const sessionDir = path.dirname(SESSION_PATH);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  const state = await context.storageState();
  fs.writeFileSync(SESSION_PATH, JSON.stringify(state, null, 2));
}

export function hasSessionFile(): boolean {
  return fs.existsSync(SESSION_PATH);
}

export function getDownloadsPath(): string {
  if (!fs.existsSync(DOWNLOADS_PATH)) fs.mkdirSync(DOWNLOADS_PATH, { recursive: true });
  return DOWNLOADS_PATH;
}

export async function closeBrowser(browser: Browser): Promise<void> {
  try {
    await browser.close();
  } catch {}
}
