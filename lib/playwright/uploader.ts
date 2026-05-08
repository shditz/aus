import { Page } from 'playwright';
import { UploadFailedError, ElementNotFoundError } from '../utils/errors';
import { AutomationConfig } from '../types';

function getReleaseDatePlus2(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function checkDistrokidLogin(page: Page): Promise<boolean> {
  await page.goto('https://distrokid.com/mymusic/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  return page.url().includes('mymusic');
}

export async function loginToDistrokid(page: Page): Promise<void> {
  await page.goto('https://distrokid.com/signin/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('mymusic')) return;

  try {
    const emailInput = page.locator('#inputEmail');
    const passInput = page.locator('#inputPassword');

    await emailInput.waitFor({ state: 'visible', timeout: 25000 });
    await emailInput.fill('mazlancreative@gmail.com');
    await passInput.fill('Terserah*1');

    const signInBtn = page.locator('#signInButtonStandalonePage');
    await signInBtn.click();
  } catch {
    throw new ElementNotFoundError('login', 'Gagal menemukan form login DistroKid');
  }

  try {
    await page.waitForURL('**/mymusic/**', { timeout: 600000 });
  } catch {
    throw new Error('SESSION_EXPIRED');
  }
}

export async function navigateToUploadPage(page: Page): Promise<void> {
  await page.goto('https://distrokid.com/new/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const formExists = await page.locator('#uploadTable').isVisible().catch(() => false);
  if (!formExists) {
    throw new ElementNotFoundError('upload_page', 'Form upload tidak ditemukan di /new/');
  }
}

export async function fillUploadForm(
  page: Page,
  audioPath: string,
  title: string,
  coverPath?: string | null,
  config?: AutomationConfig
): Promise<void> {
  try {
    const notPrevReleased = page.locator('input.distroPreviouslyReleased[value="0"]');
    if (await notPrevReleased.isVisible().catch(() => false)) {
      await notPrevReleased.check();
    }

    // Language
    if (config?.language) {
      const languageSelect = page.locator('#language');
      if (await languageSelect.isVisible().catch(() => false)) {
        await languageSelect.selectOption({ value: config.language });
      }
    }

    // Release date
    const releaseDate = config?.releaseDate || getReleaseDatePlus2();
    await page.evaluate((date: string) => {
      const el = document.querySelector('#release-date-dp') as HTMLInputElement;
      if (el) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        )?.set;
        nativeInputValueSetter?.call(el, date);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, releaseDate);
    await page.waitForTimeout(500);

    // Primary Genre
    const genreSelect = page.locator('#genrePrimary');
    if (await genreSelect.isVisible().catch(() => false)) {
      await genreSelect.selectOption({ value: config?.primaryGenre || '24' }); // Pop fallback
    }

    // Secondary Genre
    if (config?.secondaryGenre) {
      const genreSecondary = page.locator('#genreSecondary');
      if (await genreSecondary.isVisible().catch(() => false)) {
        await genreSecondary.selectOption({ value: config.secondaryGenre });
      }
    }

    // Upload cover art
    if (coverPath) {
      const artworkInput = page.locator('#artwork');
      if (await artworkInput.count() > 0) {
        await artworkInput.setInputFiles(coverPath);
        await artworkInput.evaluate((el: HTMLInputElement) => {
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        try {
          await page.waitForFunction(() => {
            const preview = document.querySelector('.artwork-preview img, #artwork-preview img, .artworkImageContainer img, img[src*="blob:"]');
            return preview !== null;
          }, { timeout: 5000 });
        } catch {
          await page.waitForTimeout(2000);
        }
      }
    }

    // Song title Track 1
    const songTitleInput = page.locator('input.uploadFileTitle').first();
    if (await songTitleInput.isVisible().catch(() => false)) {
      await songTitleInput.fill(title);
    }
    await page.waitForTimeout(500);

    // Upload audio file
    const audioInput = page.locator('#js-track-upload-1, input[name="file"][tracknum="1"]').first();
    if (await audioInput.count() > 0) {
      await audioInput.setInputFiles(audioPath);
      await audioInput.evaluate((el: HTMLInputElement) => {
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    } else {
      const fallbackAudio = page.locator('input.trackupload').first();
      if (await fallbackAudio.count() > 0) {
        await fallbackAudio.setInputFiles(audioPath);
        await fallbackAudio.evaluate((el: HTMLInputElement) => {
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    }
    try {
      await page.waitForFunction(() => {
        const trackName = document.querySelector('.trackNameDisplay, .song-file-name, .trackupload_filename, [id*="trackname"]');
        const waveform = document.querySelector('.waveform, canvas[class*="wave"], .audio-progress');
        return trackName !== null || waveform !== null;
      }, { timeout: 5000 });
    } catch {
      await page.waitForTimeout(2000);
    }

    // Songwriter
    const originalSongRadio = page.locator('input[name="coverSong_1"][value="original"]');
    if (await originalSongRadio.isVisible().catch(() => false)) {
      await originalSongRadio.check();
    }
    await page.waitForTimeout(300);

    // Songwriter role & name
    const roleSelect = page.locator('.songwriter_real_name_role').first();
    if (await roleSelect.isVisible().catch(() => false)) {
      await roleSelect.selectOption({ value: config?.songwriterRole || '197' });
      await page.waitForTimeout(300);
    }

    const firstNameInput = page.locator('input.songwriter_real_name_first').first();
    if (await firstNameInput.isVisible().catch(() => false)) {
      await firstNameInput.fill(config?.songwriterFirstName || 'Mazlan');
    }

    const middleNameInput = page.locator('input.songwriter_real_name_middle').first();
    if (await middleNameInput.isVisible().catch(() => false)) {
      await middleNameInput.fill(config?.songwriterMiddleName || '');
    }

    const lastNameInput = page.locator('input.songwriter_real_name_last').first();
    if (await lastNameInput.isVisible().catch(() => false)) {
      await lastNameInput.fill(config?.songwriterLastName || '');
    }

    // Explicit lyrics
    const notExplicit = page.locator('input[name="explicit_1"][value="notExplicit"]');
    if (await notExplicit.isVisible().catch(() => false)) {
      await notExplicit.check();
    }

    // Radio edit
    const containsLyrics = page.locator('input[name="radioEdit_1"][value="containsLyrics"]');
    if (await containsLyrics.isVisible().catch(() => false)) {
      await containsLyrics.check();
    }

    // Preview clip
    const letServiceDecide = page.locator('input[name="previewStart_1"][value="auto"]');
    if (await letServiceDecide.isVisible().catch(() => false)) {
      await letServiceDecide.check();
    }

    // Apple Music credits
    const creditsAccordion = page.locator('#requirements-credits');
    if (await creditsAccordion.isVisible().catch(() => false)) {
      const classAttr = await creditsAccordion.getAttribute('class');
      if (!classAttr?.includes('open')) {
        await page.locator('#requirements-credits .requirements-item-title').click();
        await page.waitForTimeout(500);
      }
    }

    // Apple Music credits: Performer
    const performerSelect = page.locator('#track-1-performer-1-role');
    if (await performerSelect.isVisible().catch(() => false)) {
      await performerSelect.selectOption({ value: config?.performerRole || 'Other instrument' });
      await page.waitForTimeout(300);
      const performerName = page.locator('#track-1-performer-1-name');
      if (await performerName.isVisible().catch(() => false)) {
        await performerName.fill(config?.performerName || 'Mazlan');
      }
    }

    // Apple Music credits: Producer
    const producerSelect = page.locator('#track-1-producer-1-role');
    if (await producerSelect.isVisible().catch(() => false)) {
      await producerSelect.selectOption({ value: config?.producerRole || 'Executive producer' });
      await page.waitForTimeout(300);
      const producerName = page.locator('#track-1-producer-1-name');
      if (await producerName.isVisible().catch(() => false)) {
        await producerName.fill(config?.producerName || 'Mazlan');
      }
    }

    // Centang semua mandatory checkboxes 
    const areYouSureCheckboxes = page.locator('input[type="checkbox"].areyousure');
    const areYouSureCount = await areYouSureCheckboxes.count();
    for (let i = 0; i < areYouSureCount; i++) {
      const cb = areYouSureCheckboxes.nth(i);
      if (await cb.isVisible().catch(() => false)) {
        const isChecked = await cb.isChecked();
        if (!isChecked) await cb.click();
      }
    }

    await page.waitForTimeout(1000);
  } catch (error) {
    throw new UploadFailedError(
      `Gagal mengisi form: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function verifyUploadForm(page: Page, title: string): Promise<boolean> {
  try {
    const songTitle = page.locator('input[name="song_title_1"]');
    if (await songTitle.isVisible().catch(() => false)) {
      const val = await songTitle.inputValue();
      if (!val || val.trim().length === 0) return false;
    }

    const audioInput = page.locator('input.trackupload').first();
    if (await audioInput.count() > 0) {
      const files = await audioInput.evaluate((el: HTMLInputElement) => el.files?.length || 0);
      if (files === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function submitUploadForm(page: Page): Promise<void> {
  const submitBtn = page.locator('#doneButton, #continueButton, input[value="Continue"], button:has-text("Continue")').first();
  
  if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await submitBtn.click();
  } else {
    const fallbackBtn = page.locator('button:has-text("Continue"), input[type="submit"]').first();
    if (await fallbackBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await fallbackBtn.click();
    } else {
      throw new UploadFailedError('Continue button not found on upload page');
    }
  }

  try {
    // Wait for either Mixea or Done page — DistroKid may skip Mixea entirely
    await page.waitForFunction(
      () => window.location.href.includes('/new/mixea/') || window.location.href.includes('/new/done/'),
      { timeout: 120000 }
    );
  } catch {
    if (page.url().includes('/new/done/')) {
      return; 
    }
    throw new UploadFailedError('Failed to navigate after form submission. DistroKid may have rejected the upload.');
  }
  await page.waitForTimeout(3000);
}

export async function skipMixeaPage(page: Page): Promise<void> {
  // If already on Done page, skip entirely
  if (page.url().includes('/new/done/')) {
    console.log('[Mixea] Already on Done page, skipping Mixea.');
    await page.goto('https://distrokid.com/mymusic/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    return;
  }

  // If not on Mixea page at all, the page flow has changed — just continue
  if (!page.url().includes('/new/mixea/')) {
    console.log('[Mixea] Not on Mixea page (URL: ' + page.url() + '). DistroKid may have changed the flow. Continuing...');
    await page.goto('https://distrokid.com/mymusic/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    return;
  }

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Try to select "Use my originals" — if not found, continue gracefully
  const useOriginals = page.locator('input[type="radio"][name="variant"][value="0"]');
  if (await useOriginals.count() > 0) {
    await useOriginals.check({ force: true });
    await page.waitForTimeout(1000);
  } else {
    console.log('[Mixea] "Use my originals" radio not found. Mixea page may have changed. Trying to continue...');
  }

  // Try to click the Continue button
  const continueBtn = page.locator('#rejectButton button.submit-button');
  if (await continueBtn.count() > 0) {
    try {
      await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1000);
      const isDisabled = await continueBtn.isDisabled();
      if (isDisabled) {
        await continueBtn.evaluate((btn: HTMLButtonElement) => {
          btn.disabled = false;
          btn.classList.remove('disabled');
        });
        await page.waitForTimeout(500);
      }
      await continueBtn.click();
    } catch {
      console.log('[Mixea] Could not click Continue on Mixea page. Trying fallback...');
    }
  } else {
    const fallbackBtn = page.locator('.footer-error button.submit-button');
    if (await fallbackBtn.isVisible().catch(() => false)) {
      await fallbackBtn.click();
    } else {
      // No button found — try any visible submit/continue button as last resort
      const anyBtn = page.locator('button.submit-button, button:has-text("Continue"), input[type="submit"]').first();
      if (await anyBtn.isVisible().catch(() => false)) {
        await anyBtn.click();
        console.log('[Mixea] Clicked generic continue button.');
      } else {
        console.log('[Mixea] No continue button found on Mixea page. Proceeding anyway...');
      }
    }
  }

  // Wait for Done page, but don't throw if it doesn't happen
  try {
    await page.waitForURL('**/new/done/**', { timeout: 60000 });
  } catch {
    console.log('[Mixea] Did not reach Done page after Mixea. Current URL: ' + page.url());
  }
  await page.waitForTimeout(2000);

  await page.goto('https://distrokid.com/mymusic/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
}
