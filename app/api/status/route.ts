import { automationLogger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)
      );

      const onStep = (update: { step: string; status: string; message: string; timestamp: number; error?: string }) => {
        try {
          const data = JSON.stringify({ type: 'step', ...update });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
        }
      };

      const onComplete = (updates: unknown[]) => {
        try {
          const data = JSON.stringify({ type: 'complete', updates, timestamp: Date.now() });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
        }
      };

      automationLogger.on('step', onStep);
      automationLogger.on('complete', onComplete);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      const cleanup = () => {
        automationLogger.off('step', onStep);
        automationLogger.off('complete', onComplete);
        clearInterval(heartbeat);
      };

      if (typeof controller.close === 'function') {
        setTimeout(() => {
          cleanup();
        }, 5 * 60 * 1000);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
