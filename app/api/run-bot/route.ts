import { NextRequest, NextResponse } from 'next/server';
import { runAutomation, runManualLogin } from '@/lib/playwright/main';
import { automationLogger } from '@/lib/utils/logger';
import { AutomationConfig, StepUpdate } from '@/lib/types';
import { formatErrorResponse } from '@/lib/utils/errors';

let isRunning = false;

export async function POST(request: NextRequest) {
  if (isRunning) {
    return NextResponse.json(
      { success: false, error: 'ALREADY_RUNNING', message: 'An automation is already running' },
      { status: 409 }
    );
  }

  try {
    const body = await request.json();
    const { 
      action, title, cover, metadata, songUrl, deleteFiles,
      releaseDate, language, primaryGenre, secondaryGenre,
      performerRole, performerName, producerRole, producerName,
      songwriterRole, songwriterFirstName, songwriterMiddleName, songwriterLastName
    } = body;

    isRunning = true;
    automationLogger.reset();

    const onStatus = (update: StepUpdate) => {
      automationLogger.logStep(update.step, update.status, update.message, update.error);
    };

    let result;

    if (action === 'login') {
      result = await runManualLogin(onStatus);
    } else {
      const config: AutomationConfig = {
        title: title || 'Untitled Song',
        cover,
        metadata,
        songUrl,
        deleteFiles: !!deleteFiles,
        releaseDate,
        language,
        primaryGenre,
        secondaryGenre,
        performerRole,
        performerName,
        producerRole,
        producerName,
        songwriterRole,
        songwriterFirstName,
        songwriterMiddleName,
        songwriterLastName,
      };

      result = await runAutomation(config, onStatus);
    }

    automationLogger.complete();
    result.steps = automationLogger.getUpdates();

    return NextResponse.json(result);
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  } finally {
    isRunning = false;
  }
}

export async function GET() {
  return NextResponse.json({
    status: isRunning ? 'running' : 'idle',
    message: isRunning ? 'Automation is currently running' : 'Ready to run',
  });
}
