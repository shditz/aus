import {Page} from "playwright";
import * as path from "path";
import * as fs from "fs";
import {SessionExpiredError, DownloadFailedError, ElementNotFoundError} from "../utils/errors";
import {getDownloadsPath} from "./browser";

const SUNO_URL = "https://suno.com";

export async function checkLogin(page: Page): Promise<boolean> {
  if (!page.url().includes("suno.com")) {
    await page.goto(SUNO_URL, {waitUntil: "domcontentloaded", timeout: 30000});
  }

  await page.waitForTimeout(3000);

  try {
    const result = await Promise.race([
      page
        .getByRole("button", {name: /sign in|log in/i})
        .waitFor({state: "visible", timeout: 12000})
        .then(() => false),
      page
        .getByText(/sign in|log in/i)
        .first()
        .waitFor({state: "visible", timeout: 12000})
        .then(() => false),
      page
        .getByText(/credits/i)
        .first()
        .waitFor({state: "visible", timeout: 12000})
        .then(() => true),
      page
        .getByText(/upgrade to pro/i)
        .first()
        .waitFor({state: "visible", timeout: 12000})
        .then(() => true),
      page
        .getByRole("link", {name: /create/i})
        .waitFor({state: "visible", timeout: 12000})
        .then(() => true),
    ]);

    return result;
  } catch {
    const url = page.url();
    if (
      url.includes("/create") ||
      url.includes("/me") ||
      url.includes("/discover") ||
      url.includes("/library")
    )
      return true;
    return false;
  }
}

export async function openLoginPage(page: Page): Promise<void> {
  await page.goto(SUNO_URL, {waitUntil: "domcontentloaded", timeout: 30000});
  await page.waitForTimeout(2000);

  if (await checkLogin(page)) return;

  let clicked = false;

  try {
    const btn = page.getByRole("button", {name: /sign in|log in/i});
    await btn.waitFor({state: "visible", timeout: 15000});
    await btn.click();
    clicked = true;
  } catch {}

  if (!clicked) {
    try {
      const txt = page.getByText(/sign in|log in/i).first();
      await txt.waitFor({state: "visible", timeout: 8000});
      await txt.click();
      clicked = true;
    } catch {}
  }

  if (!clicked) {
    try {
      const lnk = page.getByRole("link", {name: /sign in|log in/i});
      await lnk.waitFor({state: "visible", timeout: 8000});
      await lnk.click();
    } catch {
      throw new ElementNotFoundError("login", "Sign In button not found on Suno");
    }
  }

  await page.waitForTimeout(3000);
  try {
    await page.getByText(/welcome back/i).waitFor({state: "visible", timeout: 8000});
  } catch {}

  let discordClicked = false;
  try {
    const discordBtn = page.getByRole("button", {name: /discord/i});
    await discordBtn.waitFor({state: "visible", timeout: 8000});
    await discordBtn.click();
    discordClicked = true;
  } catch {}

  if (!discordClicked) {
    try {
      const dt = page.getByText("Discord", {exact: true}).first();
      await dt.waitFor({state: "visible", timeout: 5000});
      await dt.click();
      discordClicked = true;
    } catch {}
  }

  if (discordClicked) {
    try {
      await page.waitForURL(/discord|clerk/, {timeout: 15000});
    } catch {}
  }
}

export async function navigateToLibrary(page: Page): Promise<void> {
  const libLink = page.getByRole("link", {name: /library/i});
  if (await libLink.isVisible().catch(() => false)) {
    await libLink.click();
    try {
      await page.waitForLoadState("networkidle", {timeout: 10000});
    } catch {}
    return;
  }
  await page.goto(`${SUNO_URL}/me`, {waitUntil: "domcontentloaded", timeout: 30000});
  try {
    await page.waitForLoadState("networkidle", {timeout: 10000});
  } catch {}
}

export async function getSong(
  page: Page,
  songUrl?: string,
  searchTitle?: string,
): Promise<{title: string; pageUrl: string}> {
  if (songUrl) {
    // Navigasi langsung ke URL lagu
    await page.goto(songUrl, {waitUntil: "domcontentloaded", timeout: 30000});
    await page.waitForTimeout(2000);
    
    // Kembalikan placeholder "Untitled", biarkan dashboard atau default yang menentukan nama akhir
    return {title: "Untitled", pageUrl: songUrl};
  }


  await navigateToLibrary(page);
  await page.waitForTimeout(3000);

  // If searchTitle provided, scroll and search for matching song in library
  if (searchTitle && searchTitle.trim().length > 0) {
    const target = searchTitle.trim().toLowerCase();
    const maxScrolls = 20;

    for (let i = 0; i < maxScrolls; i++) {
      const songLinks = page.locator('a[href^="/song/"]');
      const count = await songLinks.count();

      for (let j = 0; j < count; j++) {
        const link = songLinks.nth(j);
        const text = ((await link.textContent()) || "").trim();
        if (text.toLowerCase().includes(target)) {
          // Found matching song — click to navigate to its page
          await link.click();
          await page.waitForTimeout(2000);
          return {title: text.substring(0, 100), pageUrl: page.url()};
        }
      }

      // Scroll down to load more songs
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(1500);

      // Check if we've reached the bottom
      const atBottom = await page.evaluate(() => {
        return (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 100;
      });
      if (atBottom) break;
    }

    throw new ElementNotFoundError("get_song", `Song "${searchTitle}" not found in library`);
  }

  // Fallback: pick first song from library
  let title = "Untitled";
  try {
    const firstSong = page.locator('a[href^="/song/"]').first();
    await firstSong.waitFor({state: "visible", timeout: 10000});
    title = ((await firstSong.textContent()) || "Untitled").trim().substring(0, 100);
  } catch {
    throw new ElementNotFoundError("get_song", "No songs found in library");
  }

  return {title, pageUrl: page.url()};
}

export async function downloadSong(page: Page, fileName?: string): Promise<string> {
  const dir = getDownloadsPath();
  const out = path.join(dir, fileName || `song_${Date.now()}.mp3`);

  const threeDots = page.locator('button[aria-label="More options"]').first();
  try {
    await threeDots.waitFor({state: "visible", timeout: 8000});
    await threeDots.click();
  } catch {
    const fallback = page.locator('button[data-context-menu-trigger="true"]').first();
    if (await fallback.isVisible().catch(() => false)) {
      await fallback.click();
    } else {
      throw new DownloadFailedError("Three-dot menu button not found on song row");
    }
  }
  await page.waitForTimeout(1000);

  const downloadMenuItem = page
    .locator("button.context-menu-button")
    .filter({hasText: /^Download$/})
    .first();
  try {
    await downloadMenuItem.waitFor({state: "visible", timeout: 5000});
    await downloadMenuItem.hover();
    await page.waitForTimeout(1000);
  } catch {
    const dlSpan = page.locator("span.css-s40uml", {hasText: "Download"}).first();
    if (await dlSpan.isVisible().catch(() => false)) {
      await dlSpan.hover();
      await page.waitForTimeout(1000);
    } else {
      throw new DownloadFailedError("Download menu item not found in context menu");
    }
  }

  const mp3Option = page.getByText("MP3 Audio", {exact: true});
  try {
    await mp3Option.waitFor({state: "visible", timeout: 5000});
  } catch {
    throw new DownloadFailedError("MP3 Audio option not found in Download submenu");
  }

  const downloadPromise = page.waitForEvent("download", {timeout: 30000});
  await mp3Option.click();

  try {
    const downloadAnyway = page.getByText("Download Anyway", {exact: true});
    await downloadAnyway.waitFor({state: "visible", timeout: 3000});
    await downloadAnyway.click();
  } catch {}

  try {
    const dl = await downloadPromise;
    await dl.saveAs(out);
    return out;
  } catch {
    throw new DownloadFailedError("Download timed out or failed");
  }
}

export async function downloadCoverFromPage(page: Page, fileName?: string): Promise<string> {
  const dir = getDownloadsPath();
  const out = path.join(dir, fileName || `cover_${Date.now()}.jpg`);

  const coverBtn = page.locator('button[aria-label="Download Cover Image"]');
  try {
    await coverBtn.waitFor({state: "visible", timeout: 8000});
  } catch {
    throw new DownloadFailedError("Download Cover Image button not found");
  }

  const downloadPromise = page.waitForEvent("download", {timeout: 30000});
  await coverBtn.click();

  try {
    const dl = await downloadPromise;
    await dl.saveAs(out);
    return out;
  } catch {
    throw new DownloadFailedError("Cover download timed out or failed");
  }
}

import * as NodeID3 from "node-id3";
import sharp from "sharp";

export async function extractCoverFromAudio(audioPath: string): Promise<string | null> {
  try {
    const tags = NodeID3.read(audioPath);
    if (tags && tags.image) {
      const imageObj = tags.image as any;
      if (imageObj.imageBuffer) {
        const coverPath = audioPath.replace(".mp3", "_cover.jpg");

        const resizedBuffer = await sharp(imageObj.imageBuffer)
          .resize(3000, 3000, {fit: "cover"})
          .toBuffer();

        fs.writeFileSync(coverPath, resizedBuffer);
        return coverPath;
      }
    }
    return null;
  } catch {
    return null;
  }
}
