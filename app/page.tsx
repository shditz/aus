'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import ControlPanel from '@/components/ControlPanel';
import type { NodeStatusMap } from '@/components/workflow/FlowEditor';
import type { StepUpdate } from '@/lib/types';
import { LOGO_LIGHT, LOGO_DARK } from '@/lib/constants';

const FlowEditor = dynamic(() => import('@/components/workflow/FlowEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <svg className="w-5 h-5 text-zinc-700 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
        <path className="opacity-60" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  ),
});

const defaultStatuses: NodeStatusMap = {
  trigger: { status: 'idle' },
  launch: { status: 'idle' },
  session: { status: 'idle' },
  config: { status: 'idle' },
  navigate: { status: 'idle' },
  verify: { status: 'idle' },
  auth_ok: { status: 'idle' },
  auth_fail: { status: 'idle' },
  distro_nav: { status: 'idle' },
  distro_auth: { status: 'idle' },
  library: { status: 'idle' },
  select: { status: 'idle' },
  download: { status: 'idle' },
  savefile: { status: 'idle' },
  upload: { status: 'idle' },
  distro_upload: { status: 'idle' },
  fill_form: { status: 'idle' },
  verify_form: { status: 'idle' },
  submit_form: { status: 'idle' },
  skip_mixea: { status: 'idle' },
  complete: { status: 'idle' },
};

export default function DashboardPage() {
  const [statuses, setStatuses] = useState<NodeStatusMap>(defaultStatuses);
  const [logs, setLogs] = useState<StepUpdate[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/status');

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'step') {
          const update: StepUpdate = {
            step: data.step,
            status: data.status,
            message: data.message,
            timestamp: data.timestamp,
            error: data.error,
          };

          setStatuses((prev) => {
            const next = { ...prev };
            
            if (data.status === 'error' || data.error === 'BROWSER_CLOSED' || data.step === 'complete') {
              for (const key of Object.keys(next)) {
                if (next[key as keyof NodeStatusMap].status === 'running') {
                  next[key as keyof NodeStatusMap].status = 'idle';
                }
              }
            }

            next[data.step as keyof NodeStatusMap] = {
              status: data.status,
              message: data.message,
            };

            return next;
          });

          setLogs((prev) => [...prev, update]);

          if (data.error === 'BROWSER_CLOSED') {
            setIsRunning(false);
          }
        }

        if (data.type === 'complete') {
          setIsRunning(false);
        }
      } catch {
      }
    };

    es.onerror = () => {
      setTimeout(() => {
        if (eventSourceRef.current === es) connectSSE();
      }, 3000);
    };

    eventSourceRef.current = es;
  }, []);

  useEffect(() => {
    connectSSE();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connectSSE]);

  const handleRunAutomation = async (config: {
    title: string;
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
  }) => {
    setIsMobilePanelOpen(false);
    setIsRunning(true);
    setLogs([]);
    setStatuses({
      ...defaultStatuses,
      trigger: { status: 'success', message: 'Automation triggered' },
      launch: { status: 'running', message: 'Opening browser...' },
    });

    try {
      const response = await fetch('/api/run-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run',
          ...config,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Automation failed:', result.message);
        setStatuses((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            if (next[key as keyof NodeStatusMap].status === 'running') {
              next[key as keyof NodeStatusMap].status = 'error';
              next[key as keyof NodeStatusMap].message = result.message || 'Failed';
            }
          }
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to trigger automation:', error);
      setStatuses((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key as keyof NodeStatusMap].status === 'running') {
            next[key as keyof NodeStatusMap].status = 'error';
            next[key as keyof NodeStatusMap].message = 'Network error';
          }
        }
        return next;
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleManualLogin = async () => {
    setIsMobilePanelOpen(false);
    setIsRunning(true);
    setLogs([]);
    setStatuses({
      ...defaultStatuses,
      trigger: { status: 'success', message: 'Manual login triggered' },
      launch: { status: 'running', message: 'Opening browser...' },
    });

    try {
      const response = await fetch('/api/run-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login' }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Login failed:', result.message);
        setStatuses((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            if (next[key as keyof NodeStatusMap].status === 'running') {
              next[key as keyof NodeStatusMap].status = 'error';
              next[key as keyof NodeStatusMap].message = result.message || 'Failed';
            }
          }
          return next;
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      setStatuses((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key as keyof NodeStatusMap].status === 'running') {
            next[key as keyof NodeStatusMap].status = 'error';
            next[key as keyof NodeStatusMap].message = 'Network error';
          }
        }
        return next;
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-3 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden">
              <img src={theme === 'dark' ? LOGO_LIGHT : LOGO_DARK} alt="AUS Logo" className="w-full h-full object-contain" />
            </div>
            <div>

              <p className="hidden sm:block text-[10px] text-muted font-medium uppercase tracking-wider">
                Automation Upload Song
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-border bg-elevated text-foreground hover:bg-foreground/10 transition-all shadow-sm flex items-center gap-2"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white shadow-[0_0_8px_white]' : 'bg-black'}`} />
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            {isRunning && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] text-success font-bold uppercase tracking-wider">Active</span>
              </div>
            )}
            <div className="hidden sm:block h-4 w-px bg-border mx-1" />
            <span className="hidden sm:inline text-[11px] text-muted font-mono font-bold tracking-tighter">v1.0.4 - Aditya K.</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Workflow Canvas */}
        <div className="flex-1 relative">
          {isMounted && <FlowEditor statuses={statuses} />}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobilePanelOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-30 bg-foreground text-background px-4 py-3 rounded-full shadow-xl font-bold text-[13px] flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 border border-border"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          Controls
        </button>

        {/* Divider */}
        <div className="hidden md:block w-px h-full bg-border flex-shrink-0" />

        {/* Control Panel */}
        <div className={`
          fixed inset-0 top-[60px] z-40 bg-card flex flex-col transition-transform duration-300
          ${isMobilePanelOpen ? 'translate-y-0' : 'translate-y-full'}
          md:static md:translate-y-0 md:w-[340px] md:flex-shrink-0 md:border-l md:border-border p-4 overflow-hidden
        `}>
          <ControlPanel
            logs={logs}
            isRunning={isRunning}
            onRunAutomation={handleRunAutomation}
            onManualLogin={handleManualLogin}
            onCloseMobile={() => setIsMobilePanelOpen(false)}
          />
        </div>
      </main>
    </div>
  );
}
