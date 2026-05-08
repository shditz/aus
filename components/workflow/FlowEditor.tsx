'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeTypes,
  BackgroundVariant,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import WorkflowNode from './WorkflowNode';
import type { NodeStatus } from './WorkflowNode';

export interface NodeStatusMap {
  trigger: { status: NodeStatus; message?: string };
  launch: { status: NodeStatus; message?: string };
  session: { status: NodeStatus; message?: string };
  config: { status: NodeStatus; message?: string };
  navigate: { status: NodeStatus; message?: string };
  verify: { status: NodeStatus; message?: string };
  auth_ok: { status: NodeStatus; message?: string };
  auth_fail: { status: NodeStatus; message?: string };
  distro_nav: { status: NodeStatus; message?: string };
  distro_auth: { status: NodeStatus; message?: string };
  library: { status: NodeStatus; message?: string };
  select: { status: NodeStatus; message?: string };
  download: { status: NodeStatus; message?: string };
  savefile: { status: NodeStatus; message?: string };
  upload: { status: NodeStatus; message?: string };
  distro_upload: { status: NodeStatus; message?: string };
  fill_form: { status: NodeStatus; message?: string };
  verify_form: { status: NodeStatus; message?: string };
  submit_form: { status: NodeStatus; message?: string };
  skip_mixea: { status: NodeStatus; message?: string };
  complete: { status: NodeStatus; message?: string };
}

interface FlowEditorProps {
  statuses: NodeStatusMap;
  onNodeClick?: (nodeId: string) => void;
}

const nodeTypes: NodeTypes = { workflow: WorkflowNode };

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

export default function FlowEditor({ statuses = defaultStatuses, onNodeClick }: FlowEditorProps) {
  const cx = 100;
  const cx2 = 380;
  const cx3 = 660;
  const cx4 = 940;
  const gap = 120;

  const nodes: Node[] = useMemo(() => [
    { id: 'trigger', type: 'workflow', position: { x: cx, y: gap * 0 },
      data: { label: 'Trigger', icon: 'Play', description: 'User initiated', status: statuses.trigger.status, message: statuses.trigger.message } },
    { id: 'launch', type: 'workflow', position: { x: cx, y: gap * 1 },
      data: { label: 'Launch Browser', icon: 'Globe', description: 'Chromium instance', status: statuses.launch.status, message: statuses.launch.message } },
    { id: 'config', type: 'workflow', position: { x: cx, y: gap * 2 },
      data: { label: 'Set Config', icon: 'Settings', description: 'Title & params', status: statuses.config.status, message: statuses.config.message } },
    { id: 'session', type: 'workflow', position: { x: cx, y: gap * 3 },
      data: { label: 'Session Data', icon: 'Database', description: 'session.json', status: statuses.session.status, message: statuses.session.message } },
    { id: 'navigate', type: 'workflow', position: { x: cx, y: gap * 4 },
      data: { label: 'Navigate Suno', icon: 'Navigation', description: 'suno.com', status: statuses.navigate.status, message: statuses.navigate.message } },
    { id: 'verify', type: 'workflow', position: { x: cx2, y: gap * 4 },
      data: { label: 'Verify Auth', icon: 'ShieldCheck', description: 'Check session', status: statuses.verify.status, message: statuses.verify.message } },
    { id: 'auth_ok', type: 'workflow', position: { x: cx2, y: gap * 3 },
      data: { label: 'Authenticated', icon: 'CheckCircle', description: 'Suno Session active', status: statuses.auth_ok.status, message: statuses.auth_ok.message } },
    { id: 'distro_nav', type: 'workflow', position: { x: cx2, y: gap * 2 },
      data: { label: 'Open DistroKid', icon: 'ExternalLink', description: 'distrokid.com', status: statuses.distro_nav.status, message: statuses.distro_nav.message } },
    { id: 'distro_auth', type: 'workflow', position: { x: cx2, y: gap * 1 },
      data: { label: 'DistroKid Auth', icon: 'Key', description: 'Session active', status: statuses.distro_auth.status, message: statuses.distro_auth.message } },
    { id: 'library', type: 'workflow', position: { x: cx2, y: gap * 0 },
      data: { label: 'Open Library', icon: 'Library', description: 'Browse songs', status: statuses.library.status, message: statuses.library.message } },
    { id: 'auth_fail', type: 'workflow', position: { x: cx2 + 140, y: gap * 4.8 },
      data: { label: 'Session Expired', icon: 'AlertTriangle', description: 'Manual login needed', status: statuses.auth_fail.status, message: statuses.auth_fail.message } },
    { id: 'select', type: 'workflow', position: { x: cx3, y: gap * 0 },
      data: { label: 'Select Song', icon: 'Music', description: 'Pick track', status: statuses.select.status, message: statuses.select.message } },
    { id: 'download', type: 'workflow', position: { x: cx3, y: gap * 1 },
      data: { label: 'Download Audio', icon: 'Download', description: 'MP3 file', status: statuses.download.status, message: statuses.download.message } },
    { id: 'savefile', type: 'workflow', position: { x: cx3, y: gap * 2 },
      data: { label: 'Save Files', icon: 'Save', description: 'Audio + Cover', status: statuses.savefile.status, message: statuses.savefile.message } },
    { id: 'upload', type: 'workflow', position: { x: cx3, y: gap * 3 },
      data: { label: 'Prepare Upload', icon: 'Package', description: 'Files ready', status: statuses.upload.status, message: statuses.upload.message } },
    { id: 'distro_upload', type: 'workflow', position: { x: cx3, y: gap * 4 },
      data: { label: 'Open /new/', icon: 'UploadCloud', description: 'Upload page', status: statuses.distro_upload.status, message: statuses.distro_upload.message } },
    { id: 'fill_form', type: 'workflow', position: { x: cx4, y: gap * 4 },
      data: { label: 'Fill Form', icon: 'FileText', description: 'All fields', status: statuses.fill_form.status, message: statuses.fill_form.message } },
    { id: 'verify_form', type: 'workflow', position: { x: cx4, y: gap * 3 },
      data: { label: 'Verify Form', icon: 'CheckSquare', description: 'Check completeness', status: statuses.verify_form.status, message: statuses.verify_form.message } },
    { id: 'submit_form', type: 'workflow', position: { x: cx4, y: gap * 2 },
      data: { label: 'Submit Form', icon: 'Send', description: 'Click Continue', status: statuses.submit_form.status, message: statuses.submit_form.message } },
    { id: 'skip_mixea', type: 'workflow', position: { x: cx4, y: gap * 1 },
      data: { label: 'Skip Mixea', icon: 'SkipForward', description: 'Use originals', status: statuses.skip_mixea.status, message: statuses.skip_mixea.message } },
    { id: 'complete', type: 'workflow', position: { x: cx4, y: gap * 0 },
      data: { label: 'Complete', icon: 'Flag', description: 'Pipeline finished', status: statuses.complete.status, message: statuses.complete.message } },
  ], [statuses]);

  const edges: Edge[] = useMemo(() => {
    const s = statuses;
    const active = (source: keyof NodeStatusMap, target: keyof NodeStatusMap) =>
      s[source].status === 'success' || s[target].status === 'running' || s[target].status === 'success';

    const color = (on: boolean) => on ? 'var(--text-secondary)' : 'var(--border)';
    const sw = (on: boolean) => on ? 2 : 1.5;
    const anim = (target: keyof NodeStatusMap) => s[target].status === 'running';

    return [
      { id: 'e1', source: 'trigger', target: 'launch', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight', animated: anim('launch'), style: { stroke: color(active('trigger', 'launch')), strokeWidth: sw(active('trigger', 'launch')) } },
      { id: 'e2', source: 'launch', target: 'config', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight', animated: anim('config'), style: { stroke: color(active('launch', 'config')), strokeWidth: sw(active('launch', 'config')) } },
      { id: 'e3', source: 'config', target: 'session', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight', animated: anim('session'), style: { stroke: color(active('config', 'session')), strokeWidth: sw(active('config', 'session')) } },
      { id: 'e4', source: 'session', target: 'navigate', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight', animated: anim('navigate'), style: { stroke: color(active('session', 'navigate')), strokeWidth: sw(active('session', 'navigate')) } },
      { id: 'e5', source: 'navigate', target: 'verify', sourceHandle: 'right-source', targetHandle: 'left-target', type: 'smoothstep', animated: anim('verify'), style: { stroke: color(active('navigate', 'verify')), strokeWidth: sw(active('navigate', 'verify')) } },
      { id: 'e6', source: 'verify', target: 'auth_ok', sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'straight', animated: anim('auth_ok'), style: { stroke: color(active('verify', 'auth_ok')), strokeWidth: sw(active('verify', 'auth_ok')) } },
      { id: 'e7', source: 'verify', target: 'auth_fail', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'smoothstep', animated: anim('auth_fail'), style: { stroke: s.auth_fail.status === 'error' ? '#ef4444' : color(active('verify', 'auth_fail')), strokeWidth: sw(active('verify', 'auth_fail')) } },
      { id: 'e7a', source: 'auth_ok', target: 'distro_nav', sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'straight', animated: anim('distro_nav'), style: { stroke: color(active('auth_ok', 'distro_nav')), strokeWidth: sw(active('auth_ok', 'distro_nav')) } },
      { id: 'e7b', source: 'distro_nav', target: 'distro_auth', sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'straight', animated: anim('distro_auth'), style: { stroke: color(active('distro_nav', 'distro_auth')), strokeWidth: sw(active('distro_nav', 'distro_auth')) } },
      { id: 'e8', source: 'distro_auth', target: 'library', sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'straight', animated: anim('library'), style: { stroke: color(active('distro_auth', 'library')), strokeWidth: sw(active('distro_auth', 'library')) } },
      { id: 'e9', source: 'library', target: 'select', sourceHandle: 'right-source', targetHandle: 'left-target', type: 'smoothstep', animated: anim('select'), style: { stroke: color(active('library', 'select')), strokeWidth: sw(active('library', 'select')) } },
      { id: 'e10', source: 'select', target: 'download', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight', animated: anim('download'), style: { stroke: color(active('select', 'download')), strokeWidth: sw(active('select', 'download')) } },
      { id: 'e11', source: 'download', target: 'savefile', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight', animated: anim('savefile'), style: { stroke: color(active('download', 'savefile')), strokeWidth: sw(active('download', 'savefile')) } },
      { id: 'e12', source: 'savefile', target: 'upload', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight', animated: anim('upload'), style: { stroke: color(active('savefile', 'upload')), strokeWidth: sw(active('savefile', 'upload')) } },
      { id: 'e13', source: 'upload', target: 'distro_upload', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight', animated: anim('distro_upload'), style: { stroke: color(active('upload', 'distro_upload')), strokeWidth: sw(active('upload', 'distro_upload')) } },
      { id: 'e14', source: 'distro_upload', target: 'fill_form', sourceHandle: 'right-source', targetHandle: 'left-target', type: 'smoothstep', animated: anim('fill_form'), style: { stroke: color(active('distro_upload', 'fill_form')), strokeWidth: sw(active('distro_upload', 'fill_form')) } },
      { id: 'e15', source: 'fill_form', target: 'verify_form', sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'straight', animated: anim('verify_form'), style: { stroke: color(active('fill_form', 'verify_form')), strokeWidth: sw(active('fill_form', 'verify_form')) } },
      { id: 'e16', source: 'verify_form', target: 'submit_form', sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'straight', animated: anim('submit_form'), style: { stroke: color(active('verify_form', 'submit_form')), strokeWidth: sw(active('verify_form', 'submit_form')) } },
      { id: 'e17', source: 'submit_form', target: 'skip_mixea', sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'straight', animated: anim('skip_mixea'), style: { stroke: color(active('submit_form', 'skip_mixea')), strokeWidth: sw(active('submit_form', 'skip_mixea')) } },
      { id: 'e18', source: 'skip_mixea', target: 'complete', sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'straight', animated: anim('complete'), style: { stroke: color(active('skip_mixea', 'complete')), strokeWidth: sw(active('skip_mixea', 'complete')) } },
    ];
  }, [statuses]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => { onNodeClick?.(node.id); }, [onNodeClick]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false} nodesConnectable={false}
        elementsSelectable minZoom={0.3} maxZoom={1.5}
        className="bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.03)" />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  );
}
