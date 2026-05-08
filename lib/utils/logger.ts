import { EventEmitter } from 'eventemitter3';
import { AutomationStep, StepStatus, StepUpdate } from '../types';

interface LoggerEvents {
  step: (update: StepUpdate) => void;
  complete: (updates: StepUpdate[]) => void;
}

class AutomationLogger extends EventEmitter<LoggerEvents> {
  private updates: StepUpdate[] = [];

  logStep(step: AutomationStep, status: StepStatus, message: string, error?: string) {
    const update: StepUpdate = { step, status, message, timestamp: Date.now(), error };
    this.updates.push(update);
    this.emit('step', update);
  }

  getUpdates(): StepUpdate[] {
    return [...this.updates];
  }

  reset() {
    this.updates = [];
  }

  complete() {
    this.emit('complete', this.getUpdates());
  }
}

const globalForLogger = globalThis as unknown as { automationLogger: AutomationLogger };
export const automationLogger = globalForLogger.automationLogger || new AutomationLogger();
if (process.env.NODE_ENV !== 'production') globalForLogger.automationLogger = automationLogger;

export { AutomationLogger };
