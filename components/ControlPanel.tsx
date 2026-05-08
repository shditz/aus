'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { StepUpdate } from '@/lib/types';
import { DISTROKID_LANGUAGES, DISTROKID_GENRES, DISTROKID_PERFORMER_ROLES, DISTROKID_PRODUCER_ROLES } from '@/lib/constants';

interface ControlPanelProps {
  logs: StepUpdate[];
  isRunning: boolean;
  onRunAutomation: (config: { 
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
    songwriterFirstName?: string;
    songwriterMiddleName?: string;
    songwriterLastName?: string;
    songwriterRole?: string;
  }) => void;
  onManualLogin: () => void;
  onCloseMobile?: () => void;
}

export default function ControlPanel({
  logs,
  isRunning,
  onRunAutomation,
  onManualLogin,
  onCloseMobile,
}: ControlPanelProps) {
  const [title, setTitle] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [deleteFiles, setDeleteFiles] = useState(false);

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  const defaultDateString = defaultDate.toISOString().split('T')[0];

  const [releaseDate, setReleaseDate] = useState(defaultDateString);
  const [language, setLanguage] = useState('10'); 
  const [primaryGenre, setPrimaryGenre] = useState('24'); 
  const [secondaryGenre, setSecondaryGenre] = useState('');
  const [performerRole, setPerformerRole] = useState('Other instrument');
  const [performerName, setPerformerName] = useState('Mazlan');
  const [producerRole, setProducerRole] = useState('Executive producer');
  const [producerName, setProducerName] = useState('Mazlan');
  const [songwriterRole, setSongwriterRole] = useState('197'); 
  const [songwriterFirst, setSongwriterFirst] = useState('Mazlan');
  const [songwriterMiddle, setSongwriterMiddle] = useState('');
  const [songwriterLast, setSongwriterLast] = useState('M.');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRun = () => {
    onRunAutomation({
      title: title.trim(),
      songUrl: songUrl || undefined,
      deleteFiles,
      releaseDate,
      language,
      primaryGenre,
      secondaryGenre,
      performerRole: performerRole !== 'unselected' ? performerRole : undefined,
      performerName,
      producerRole: producerRole !== 'unselected' ? producerRole : undefined,
      producerName,
      songwriterFirstName: songwriterFirst,
      songwriterMiddleName: songwriterMiddle,
      songwriterLastName: songwriterLast,
      songwriterRole,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-32px)] gap-4">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-wide">
            Controls
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isRunning
                ? 'bg-foreground/10 text-foreground'
                : 'bg-foreground/5 text-muted'
            }`}>
              {isRunning ? 'Running' : 'Ready'}
            </span>
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-md bg-elevated hover:bg-foreground/10 text-muted hover:text-foreground transition-colors border border-border"
                aria-label="Close controls"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>
        </div>
        <div className="h-px bg-zinc-800/60 mt-3" />
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
        <div>
          <label className="block text-[11px] text-muted mb-1.5 font-medium uppercase tracking-widest">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title..."
            disabled={isRunning}
            className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-[13px] text-foreground placeholder-muted focus:outline-none focus:border-muted transition-colors disabled:opacity-40"
          />
        </div>

        <div>
          <label className="block text-[11px] text-muted mb-1.5 font-medium uppercase tracking-widest">
            Song URL
            <span className="text-muted ml-1 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            placeholder="https://suno.com/song/..."
            disabled={isRunning}
            className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-[13px] text-foreground placeholder-muted focus:outline-none focus:border-muted transition-colors disabled:opacity-40"
          />
        </div>

        <details className="group border border-border rounded-lg bg-elevated/50">
          <summary className="px-3 py-2.5 text-[12px] font-medium text-foreground cursor-pointer select-none">
            Advanced Options
          </summary>
          <div className="p-3 pt-0 space-y-4 border-t border-border mt-1">
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[10px] text-muted mb-1 font-medium uppercase tracking-widest">
                  Release Date
                </label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted mb-1 font-medium uppercase tracking-widest">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                >
                  {DISTROKID_LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-muted mb-1 font-medium uppercase tracking-widest">
                  Primary Genre
                </label>
                <select
                  value={primaryGenre}
                  onChange={(e) => setPrimaryGenre(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                >
                  <option value="">Select a genre</option>
                  {DISTROKID_GENRES.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-muted mb-1 font-medium uppercase tracking-widest">
                  Secondary Genre
                </label>
                <select
                  value={secondaryGenre}
                  onChange={(e) => setSecondaryGenre(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                >
                  <option value="">Select another genre</option>
                  {DISTROKID_GENRES.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-muted mb-1 font-medium uppercase tracking-widest">
                Performer
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={performerRole}
                  onChange={(e) => setPerformerRole(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                >
                  <option value="unselected">Select a role</option>
                  {DISTROKID_PERFORMER_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={performerName}
                  onChange={(e) => setPerformerName(e.target.value)}
                  placeholder="Performer Name"
                  disabled={isRunning}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-muted mb-1 font-medium uppercase tracking-widest">
                Producer
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={producerRole}
                  onChange={(e) => setProducerRole(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                >
                  <option value="unselected">Select a role</option>
                  {DISTROKID_PRODUCER_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={producerName}
                  onChange={(e) => setProducerName(e.target.value)}
                  placeholder="Producer Name"
                  disabled={isRunning}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] text-muted mb-1 font-medium uppercase tracking-widest">
                Songwriter Real Name
              </label>
              <div className="flex gap-2">
                <select
                  value={songwriterRole}
                  onChange={(e) => setSongwriterRole(e.target.value)}
                  disabled={isRunning}
                  className="w-1/3 px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                >
                  <option value="125">Music</option>
                  <option value="126">Lyrics</option>
                  <option value="197">Music and lyrics</option>
                </select>
                <div className="grid grid-cols-3 gap-2 w-2/3">
                  <input
                    type="text"
                    value={songwriterFirst}
                    onChange={(e) => setSongwriterFirst(e.target.value)}
                    placeholder="First"
                    disabled={isRunning}
                    className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                  />
                  <input
                    type="text"
                    value={songwriterMiddle}
                    onChange={(e) => setSongwriterMiddle(e.target.value)}
                    placeholder="Middle"
                    disabled={isRunning}
                    className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                  />
                  <input
                    type="text"
                    value={songwriterLast}
                    onChange={(e) => setSongwriterLast(e.target.value)}
                    placeholder="Last"
                    disabled={isRunning}
                    className="w-full px-2 py-1.5 bg-background border border-border rounded text-[12px] text-foreground focus:outline-none focus:border-muted disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>
        </details>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            role="switch"
            aria-checked={deleteFiles}
            onClick={() => setDeleteFiles(!deleteFiles)}
            disabled={isRunning}
            className={`
              relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50
              ${deleteFiles ? 'bg-foreground' : 'bg-foreground/20'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out
                ${deleteFiles ? 'translate-x-5 bg-background' : 'translate-x-0 bg-white'}
              `}
            />
          </button>
          <span 
            className="text-[12px] text-foreground/80 font-medium cursor-pointer hover:text-foreground transition-colors" 
            onClick={() => !isRunning && setDeleteFiles(!deleteFiles)}
          >
            Delete file after upload
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex-1 relative overflow-hidden px-4 py-2.5 bg-foreground text-background text-[13px] font-semibold rounded-lg hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Processing...
            </span>
          ) : (
            'Run Automation'
          )}
        </button>

        <button
          onClick={onManualLogin}
          disabled={isRunning}
          className="px-4 py-2.5 bg-elevated border border-border text-foreground/70 text-[13px] font-medium rounded-lg hover:bg-border hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
        >
          Login
        </button>
      </div>

      <div className="h-px bg-zinc-800/60 shrink-0" />

      <div className="shrink-0 h-[220px] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
            Activity
          </h3>
          {logs.length > 0 && (
            <span className="text-[11px] text-zinc-700">{logs.length}</span>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto rounded-lg bg-elevated/50 border border-border/50 font-mono text-[11px]">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted p-4">
              No activity yet
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 py-1 px-1.5 rounded hover:bg-foreground/5 transition-colors"
                  style={{ animation: `fadeIn 0.2s ease-out ${Math.min(index * 0.03, 0.3)}s both` }}
                >
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    log.status === 'success' ? 'bg-success' :
                    log.status === 'error' ? 'bg-error' :
                    log.status === 'running' ? 'bg-running animate-pulse' :
                    'bg-border'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <span className="text-muted">{log.step}</span>
                    <span className="text-muted/60 mx-1">→</span>
                    <span className={`${
                      log.status === 'error' ? 'text-error' : 'text-foreground/80'
                    }`}>
                      {log.message}
                    </span>
                  </div>

                  <span className="text-muted/60 flex-shrink-0 tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
