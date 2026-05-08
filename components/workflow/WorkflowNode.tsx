'use client';

import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped';

export interface WorkflowNodeData {
  label: string;
  icon: string;
  description?: string;
  status: NodeStatus;
  message?: string;
  [key: string]: unknown;
}

export function WorkflowNode({ data, isConnectable }: NodeProps) {
  const nodeData = data as unknown as WorkflowNodeData;
  const status = nodeData.status || 'idle';

  const bgColor =
    status === 'running'
      ? 'bg-card shadow-lg border-foreground/80 dark:border-foreground/60'
      : status === 'success'
      ? 'bg-card/60 border-foreground/30 dark:border-foreground/40'
      : status === 'error'
      ? 'bg-card border-error/50 shadow-[0_8px_30px_rgb(239,68,68,0.15)]'
      : 'bg-card border-foreground/40 dark:border-foreground/20';

  const textColor =
    status === 'running'
      ? 'text-foreground font-semibold'
      : status === 'success'
      ? 'text-foreground/80'
      : status === 'error'
      ? 'text-error font-medium'
      : 'text-foreground/60';

  const descColor =
    status === 'success'
      ? 'text-foreground/60'
      : status === 'running'
      ? 'text-foreground/70'
      : 'text-foreground/40';

  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all duration-500
        ${bgColor}
        group w-[220px]
      `}
    >

      <div className="px-4 py-3 flex items-center gap-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0
          ${status === 'running' ? 'bg-running text-background shadow-lg shadow-running/20' : 
            status === 'success' ? 'bg-foreground text-background' : 
            status === 'error' ? 'bg-error/20 text-error' : 
            'bg-foreground/5 text-muted'}
        `}>
          {status === 'running' ? (
            <Icons.Loader2 className="w-4 h-4 animate-spin text-background" />
          ) : status === 'success' ? (
            <Icons.Check className="w-4 h-4 text-background" strokeWidth={3} />
          ) : status === 'error' ? (
            <Icons.X className="w-4 h-4 text-error" strokeWidth={3} />
          ) : (
            React.createElement((Icons as any)[nodeData.icon] || Icons.Circle, { className: 'w-4 h-4' })
          )}
        </div>

        <div className="min-w-0">
          <div className={`text-[13px] leading-tight ${textColor}`}>
            {nodeData.label}
          </div>
          {nodeData.description && status === 'idle' && (
            <div className={`text-[11px] mt-0.5 leading-tight ${descColor}`}>
              {nodeData.description}
            </div>
          )}
          {status !== 'idle' && nodeData.message && (
            <div className={`text-[11px] mt-0.5 leading-tight truncate max-w-[140px] ${descColor}`}>
              {nodeData.message}
            </div>
          )}
        </div>
      </div>

      {status === 'running' && (
        <div className="absolute bottom-0 left-2 right-2 h-px overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-running shadow-[0_0_5px_var(--running)] rounded-full" style={{ animation: 'shimmer 1.5s ease-in-out infinite' }} />
        </div>
      )}

      <Handle type="target" position={Position.Top} id="top-target" isConnectable={isConnectable} className="!opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" isConnectable={isConnectable} className="!opacity-0" />
      <Handle type="target" position={Position.Left} id="left-target" isConnectable={isConnectable} className="!opacity-0" />
      <Handle type="target" position={Position.Right} id="right-target" isConnectable={isConnectable} className="!opacity-0" />

      <Handle type="source" position={Position.Top} id="top-source" isConnectable={isConnectable} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" isConnectable={isConnectable} className="!opacity-0" />
      <Handle type="source" position={Position.Left} id="left-source" isConnectable={isConnectable} className="!opacity-0" />
      <Handle type="source" position={Position.Right} id="right-source" isConnectable={isConnectable} className="!opacity-0" />
    </div>
  );
}

export default WorkflowNode;
