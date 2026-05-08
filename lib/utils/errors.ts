export class AutomationError extends Error {
  public readonly code: string;
  public readonly step: string;

  constructor(code: string, step: string, message: string) {
    super(message);
    this.name = 'AutomationError';
    this.code = code;
    this.step = step;
  }
}

export class SessionExpiredError extends AutomationError {
  constructor(message = 'Suno session has expired. Please login again.') {
    super('SESSION_EXPIRED', 'login', message);
    this.name = 'SessionExpiredError';
  }
}

export class DownloadFailedError extends AutomationError {
  constructor(message = 'Failed to download song from Suno.') {
    super('DOWNLOAD_FAILED', 'download', message);
    this.name = 'DownloadFailedError';
  }
}

export class UploadFailedError extends AutomationError {
  constructor(message = 'Failed to upload song to target website.') {
    super('UPLOAD_FAILED', 'upload', message);
    this.name = 'UploadFailedError';
  }
}

export class ElementNotFoundError extends AutomationError {
  constructor(step: string, message = 'Required element not found on page.') {
    super('ELEMENT_NOT_FOUND', step, message);
    this.name = 'ElementNotFoundError';
  }
}

export function formatErrorResponse(error: unknown) {
  if (error instanceof AutomationError) {
    return {
      success: false as const,
      step: error.step,
      error: error.code,
      message: error.message,
    };
  }
  return {
    success: false as const,
    step: 'unknown',
    error: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
}
