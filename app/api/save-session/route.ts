import { NextResponse } from 'next/server';
import { launchBrowser, createContext, saveSession, closeBrowser } from '@/lib/playwright/browser';
import { checkLogin } from '@/lib/playwright/suno';

export async function POST() {
  let browser = null;

  try {
    browser = await launchBrowser();
    const context = await createContext(browser);
    const page = await context.newPage();

    const isLoggedIn = await checkLogin(page);

    if (isLoggedIn) {
      await saveSession(context);
      return NextResponse.json({
        success: true,
        message: 'Session saved successfully',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Not logged in. Please login first.',
      },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save session',
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await closeBrowser(browser);
    }
  }
}
