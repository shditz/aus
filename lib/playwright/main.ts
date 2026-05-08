import { Browser, BrowserContext, Page } from 'playwright';
import { launchBrowser, createContext, saveSession, closeBrowser, getDownloadsPath } from './browser';
import * as fs from 'fs';
import * as path from 'path';
import { checkLogin, getSong, downloadSong, extractCoverFromAudio, openLoginPage, downloadCoverFromPage } from './suno';
import { checkDistrokidLogin, loginToDistrokid, navigateToUploadPage, fillUploadForm, verifyUploadForm, submitUploadForm, skipMixeaPage } from './uploader';
import { AutomationStep, AutomationConfig, AutomationResult, StatusCallback } from '../types';
import { SessionExpiredError, formatErrorResponse } from '../utils/errors';
import { withRetry } from '../utils/retry';

let aborted = false;

function checkAbort() {
  if (aborted) throw new Error('BROWSER_CLOSED');
}

function deleteFile(filePath: string | null | undefined): boolean {
  if (!filePath) return false;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch {}
  return false;
}

export async function runAutomation(
  config: AutomationConfig,
  onStatus: StatusCallback
): Promise<AutomationResult> {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let downloadedFile: string | undefined;
  let coverFile: string | null = null;
  aborted = false;

  try {
    onStatus({ step: AutomationStep.TRIGGER, status: 'success', message: 'Triggered automatically', timestamp: Date.now() });

    onStatus({ step: AutomationStep.LAUNCH, status: 'running', message: 'Starting Chromium...', timestamp: Date.now() });
    browser = await launchBrowser();

    browser.on('disconnected', () => {
      aborted = true;
      if (config.deleteFiles) {
        deleteFile(downloadedFile);
        deleteFile(coverFile);
      }
      onStatus({ step: AutomationStep.COMPLETE, status: 'error', message: 'Browser was closed', timestamp: Date.now(), error: 'BROWSER_CLOSED' });
    });

    context = await createContext(browser);
    page = await context.newPage();
    onStatus({ step: AutomationStep.LAUNCH, status: 'success', message: 'Chromium active', timestamp: Date.now() });
    checkAbort();

    onStatus({ step: AutomationStep.SESSION, status: 'running', message: 'Loading...', timestamp: Date.now() });
    onStatus({ step: AutomationStep.CONFIG, status: 'running', message: 'Setting params...', timestamp: Date.now() });
    onStatus({ step: AutomationStep.CONFIG, status: 'success', message: `Title: ${config.title || 'Auto'}`, timestamp: Date.now() });
    onStatus({ step: AutomationStep.SESSION, status: 'success', message: 'Session loaded', timestamp: Date.now() });

    // === SUNO AUTH ===
    onStatus({ step: AutomationStep.NAVIGATE, status: 'running', message: 'Loading suno.com...', timestamp: Date.now() });
    const isLoggedIn = await withRetry(() => checkLogin(page!), 1);
    checkAbort();
    onStatus({ step: AutomationStep.NAVIGATE, status: 'success', message: 'Page loaded', timestamp: Date.now() });

    onStatus({ step: AutomationStep.VERIFY, status: 'running', message: 'Checking auth state...', timestamp: Date.now() });

    if (!isLoggedIn) {
      onStatus({ step: AutomationStep.VERIFY, status: 'success', message: 'Check finished', timestamp: Date.now() });
      onStatus({ step: AutomationStep.AUTH_FAIL, status: 'error', message: 'Session expired', timestamp: Date.now(), error: 'SESSION_EXPIRED' });
      throw new SessionExpiredError();
    }

    await saveSession(context);
    onStatus({ step: AutomationStep.VERIFY, status: 'success', message: 'Session valid', timestamp: Date.now() });
    onStatus({ step: AutomationStep.AUTH_OK, status: 'success', message: 'Authenticated', timestamp: Date.now() });

    // === DISTROKID AUTH ===
    onStatus({ step: AutomationStep.DISTRO_NAV, status: 'running', message: 'Opening DistroKid...', timestamp: Date.now() });
    const isDistroLoggedIn = await withRetry(() => checkDistrokidLogin(page!), 1);

    if (!isDistroLoggedIn) {
      onStatus({ step: AutomationStep.DISTRO_NAV, status: 'error', message: 'DistroKid not logged in', timestamp: Date.now() });
      throw new SessionExpiredError();
    }

    onStatus({ step: AutomationStep.DISTRO_NAV, status: 'success', message: 'DistroKid opened', timestamp: Date.now() });
    onStatus({ step: AutomationStep.DISTRO_AUTH, status: 'success', message: 'Session valid', timestamp: Date.now() });
    checkAbort();

    // === SUNO LIBRARY & DOWNLOAD ===
    onStatus({ step: AutomationStep.LIBRARY, status: 'running', message: 'Opening library...', timestamp: Date.now() });
    const song = await withRetry(() => getSong(page!, config.songUrl, config.title || undefined), 2);
    checkAbort();
    onStatus({ step: AutomationStep.LIBRARY, status: 'success', message: 'Library loaded', timestamp: Date.now() });

    onStatus({ step: AutomationStep.SELECT, status: 'running', message: 'Picking track...', timestamp: Date.now() });
    onStatus({ step: AutomationStep.SELECT, status: 'success', message: song.title.substring(0, 40), timestamp: Date.now() });

    const songTitle = config.title || song.title || 'Untitled Song';

    // Download cover + audio from song page, or fallback to metadata extraction
    const onSongPage = page!.url().includes('/song/');

    if (onSongPage) {
      onStatus({ step: AutomationStep.DOWNLOAD, status: 'running', message: 'Downloading cover...', timestamp: Date.now() });
      coverFile = await withRetry(() => downloadCoverFromPage(page!), 2);
      checkAbort();
      onStatus({ step: AutomationStep.DOWNLOAD, status: 'running', message: 'Downloading audio...', timestamp: Date.now() });
      downloadedFile = await withRetry(() => downloadSong(page!, `${songTitle}.mp3`), 2);
      checkAbort();
      onStatus({ step: AutomationStep.DOWNLOAD, status: 'success', message: 'Download finished', timestamp: Date.now() });

      onStatus({ step: AutomationStep.SAVEFILE, status: 'success', message: 'Audio + Cover saved', timestamp: Date.now() });
    } else {
      onStatus({ step: AutomationStep.DOWNLOAD, status: 'running', message: 'Downloading audio...', timestamp: Date.now() });
      downloadedFile = await withRetry(() => downloadSong(page!, `${songTitle}.mp3`), 2);
      checkAbort();
      onStatus({ step: AutomationStep.DOWNLOAD, status: 'success', message: 'Download finished', timestamp: Date.now() });

      onStatus({ step: AutomationStep.SAVEFILE, status: 'running', message: 'Extracting cover...', timestamp: Date.now() });
      coverFile = await extractCoverFromAudio(downloadedFile!);
      onStatus({ step: AutomationStep.SAVEFILE, status: 'success', message: coverFile ? 'Audio + Cover saved' : 'Audio saved (no cover)', timestamp: Date.now() });
    }

    // === DISTROKID UPLOAD ===
    onStatus({ step: AutomationStep.UPLOAD, status: 'success', message: 'Files ready', timestamp: Date.now() });

    onStatus({ step: AutomationStep.DISTRO_UPLOAD, status: 'running', message: 'Opening upload page...', timestamp: Date.now() });
    await navigateToUploadPage(page!);
    checkAbort();
    onStatus({ step: AutomationStep.DISTRO_UPLOAD, status: 'success', message: 'Upload page loaded', timestamp: Date.now() });

    onStatus({ step: AutomationStep.FILL_FORM, status: 'running', message: 'Filling form...', timestamp: Date.now() });
    await fillUploadForm(page!, downloadedFile!, songTitle, coverFile, config);
    checkAbort();
    onStatus({ step: AutomationStep.FILL_FORM, status: 'success', message: 'Form filled', timestamp: Date.now() });

    onStatus({ step: AutomationStep.VERIFY_FORM, status: 'running', message: 'Verifying form...', timestamp: Date.now() });
    const formValid = await verifyUploadForm(page!, songTitle);
    onStatus({ step: AutomationStep.VERIFY_FORM, status: formValid ? 'success' : 'error', message: formValid ? 'Form verified' : 'Form incomplete', timestamp: Date.now() });

    if (!formValid) {
      onStatus({ step: AutomationStep.COMPLETE, status: 'error', message: 'Form verification failed — cannot submit', timestamp: Date.now() });
      return { success: false, message: 'Form incomplete', steps: [], downloadedFile };
    }

    // === SUBMIT FORM ===
    onStatus({ step: AutomationStep.SUBMIT_FORM, status: 'running', message: 'Submitting form...', timestamp: Date.now() });
    await submitUploadForm(page!);
    checkAbort();
    onStatus({ step: AutomationStep.SUBMIT_FORM, status: 'success', message: 'Form submitted', timestamp: Date.now() });

    // === SKIP MIXEA ===
    onStatus({ step: AutomationStep.SKIP_MIXEA, status: 'running', message: 'Skipping Mixea enhancement...', timestamp: Date.now() });
    await skipMixeaPage(page!);
    checkAbort();
    onStatus({ step: AutomationStep.SKIP_MIXEA, status: 'success', message: 'Mixea skipped — using originals', timestamp: Date.now() });

    onStatus({ step: AutomationStep.COMPLETE, status: 'success', message: 'Upload complete! Back to dashboard.', timestamp: Date.now() });

    return { success: true, message: 'Automation completed', steps: [], downloadedFile };
  } catch (error) {
    if (aborted) {
      return { success: false, message: 'Browser was closed by user', steps: [], error: 'BROWSER_CLOSED' };
    }
    const info = formatErrorResponse(error);
    onStatus({ step: (info.step as AutomationStep) || AutomationStep.COMPLETE, status: 'error', message: info.message, timestamp: Date.now(), error: info.error });
    return { success: false, message: info.message, steps: [], error: info.error, downloadedFile };
  }
}

export async function runManualLogin(onStatus: StatusCallback): Promise<AutomationResult> {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  aborted = false;

  try {
    onStatus({ step: AutomationStep.TRIGGER, status: 'success', message: 'Manual login started', timestamp: Date.now() });

    onStatus({ step: AutomationStep.LAUNCH, status: 'running', message: 'Launching Chromium...', timestamp: Date.now() });
    browser = await launchBrowser();
    browser.on('disconnected', () => {
      aborted = true;
      onStatus({ step: AutomationStep.COMPLETE, status: 'error', message: 'Browser closed by user', timestamp: Date.now(), error: 'BROWSER_CLOSED' });
    });
    context = await createContext(browser);
    page = await context.newPage();
    onStatus({ step: AutomationStep.LAUNCH, status: 'success', message: 'Browser ready', timestamp: Date.now() });

    onStatus({ step: AutomationStep.CONFIG, status: 'success', message: 'Manual (No config)', timestamp: Date.now() });
    onStatus({ step: AutomationStep.SESSION, status: 'success', message: 'Session loaded', timestamp: Date.now() });

    onStatus({ step: AutomationStep.NAVIGATE, status: 'running', message: 'Opening Suno Sign In...', timestamp: Date.now() });
    await openLoginPage(page);
    if (aborted) throw new Error('BROWSER_CLOSED');
    onStatus({ step: AutomationStep.NAVIGATE, status: 'success', message: 'Suno opened', timestamp: Date.now() });

    onStatus({ step: AutomationStep.VERIFY, status: 'running', message: 'Checking auth state...', timestamp: Date.now() });

    let loggedIn = await checkLogin(page);

    if (!loggedIn) {
      onStatus({ step: AutomationStep.VERIFY, status: 'running', message: 'Waiting for manual login...', timestamp: Date.now() });
      const maxWait = 600000;
      const start = Date.now();
      let tick = 0;

      while (!loggedIn && Date.now() - start < maxWait && !aborted) {
        await page.waitForTimeout(5000);
        if (aborted) break;
        tick++;

        try {
          const url = page.url();
          if (url.includes('suno.com')) {
            loggedIn = await checkLogin(page);
          } else if (tick % 3 === 0) {
            onStatus({ step: AutomationStep.VERIFY, status: 'running', message: `Waiting for Discord... (${Math.round((Date.now() - start) / 1000)}s)`, timestamp: Date.now() });
          }
        } catch {}
      }
    }

    if (aborted) throw new Error('BROWSER_CLOSED');

    if (!loggedIn) {
      onStatus({ step: AutomationStep.AUTH_FAIL, status: 'error', message: 'Login timeout', timestamp: Date.now() });
      throw new SessionExpiredError('Login timeout — 10 minutes exceeded');
    }

    onStatus({ step: AutomationStep.VERIFY, status: 'success', message: 'Suno Auth verified', timestamp: Date.now() });
    onStatus({ step: AutomationStep.AUTH_OK, status: 'success', message: 'Suno Session active', timestamp: Date.now() });

    onStatus({ step: AutomationStep.DISTRO_NAV, status: 'running', message: 'Opening DistroKid Sign In...', timestamp: Date.now() });
    try {
      await loginToDistrokid(page);
      onStatus({ step: AutomationStep.DISTRO_NAV, status: 'success', message: 'DistroKid opened', timestamp: Date.now() });
      onStatus({ step: AutomationStep.DISTRO_AUTH, status: 'success', message: 'DistroKid Session active', timestamp: Date.now() });
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        onStatus({ step: AutomationStep.DISTRO_AUTH, status: 'error', message: 'Timeout 2FA', timestamp: Date.now() });
        throw new SessionExpiredError('Login DistroKid timeout — 10 menit habis.');
      }
      onStatus({ step: AutomationStep.DISTRO_NAV, status: 'error', message: 'Failed', timestamp: Date.now() });
      throw err;
    }

    await saveSession(context);

    const skippedSteps = [
      AutomationStep.LIBRARY, AutomationStep.SELECT, AutomationStep.DOWNLOAD,
      AutomationStep.SAVEFILE, AutomationStep.UPLOAD,
      AutomationStep.DISTRO_UPLOAD, AutomationStep.FILL_FORM, AutomationStep.VERIFY_FORM,
      AutomationStep.SUBMIT_FORM, AutomationStep.SKIP_MIXEA
    ];
    for (const step of skippedSteps) {
      onStatus({ step, status: 'skipped', message: 'Skipped (Manual Login)', timestamp: Date.now() });
    }

    onStatus({ step: AutomationStep.COMPLETE, status: 'success', message: 'Login finished', timestamp: Date.now() });

    return { success: true, message: 'Login successful', steps: [] };
  } catch (error) {
    if (aborted) {
      return { success: false, message: 'Browser closed by user', steps: [], error: 'BROWSER_CLOSED' };
    }
    const info = formatErrorResponse(error);
    onStatus({ step: AutomationStep.COMPLETE, status: 'error', message: info.message, timestamp: Date.now(), error: info.error });
    return { success: false, message: info.message, steps: [], error: info.error };
  } finally {
    if (browser && !aborted) await closeBrowser(browser);
  }
}
