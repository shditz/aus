export enum AutomationStep {
  TRIGGER = 'trigger',
  LAUNCH = 'launch',
  SESSION = 'session',
  CONFIG = 'config',
  NAVIGATE = 'navigate',
  VERIFY = 'verify',
  AUTH_OK = 'auth_ok',
  AUTH_FAIL = 'auth_fail',
  DISTRO_NAV = 'distro_nav',
  DISTRO_AUTH = 'distro_auth',
  LIBRARY = 'library',
  SELECT = 'select',
  DOWNLOAD = 'download',
  SAVEFILE = 'savefile',
  UPLOAD = 'upload',
  DISTRO_UPLOAD = 'distro_upload',
  FILL_FORM = 'fill_form',
  VERIFY_FORM = 'verify_form',
  SUBMIT_FORM = 'submit_form',
  SKIP_MIXEA = 'skip_mixea',
  COMPLETE = 'complete',
}

export type StepStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped';

export interface StepUpdate {
  step: AutomationStep;
  status: StepStatus;
  message: string;
  timestamp: number;
  error?: string;
}

export interface AutomationConfig {
  title: string;
  cover?: string;
  metadata?: Record<string, unknown>;
  songUrl?: string; 
  deleteFiles?: boolean;
  releaseDate?: string;
  language?: string;
  primaryGenre?: string;
  secondaryGenre?: string;
  performerRole?: string;
  performerName?: string;
  producerRole?: string;
  producerName?: string;
  songwriterRole?: string;
  songwriterFirstName?: string;
  songwriterMiddleName?: string;
  songwriterLastName?: string;
}

export interface AutomationResult {
  success: boolean;
  message: string;
  steps: StepUpdate[];
  downloadedFile?: string;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  step: string;
  error: string;
  message: string;
}

export type StatusCallback = (update: StepUpdate) => void;

export interface SunoSong {
  title: string;
  url: string;
  imageUrl?: string;
  duration?: string;
}
