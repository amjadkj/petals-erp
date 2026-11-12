'use client';

import React from 'react';
import { Drawer } from '@/components/ui';
import type { AuditLogDto } from '../types';
import {
  FileCode,
  User,
  Clock,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogDto | null;
}

export function AuditLogDetailDrawer({
  isOpen,
  onClose,
  log,
}: AuditLogDetailDrawerProps) {
  if (!log) return null;

  const date = new Date(log.createdAt);

  const getActionColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('DEACTIVATE')) {
      return 'bg-danger-bg text-danger border-danger/30';
    }
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('REGISTER')) {
      return 'bg-success-bg text-success border-success/30';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('PERMISSION')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-purple-600" />
          <span>Audit Log Event Details</span>
        </div>
      }
      width="max-w-[480px]"
    >
      <div className="space-y-5 text-xs">
        {/* Action & Timestamp Header */}
        <div className="p-4 bg-purple-50/50 border border-[#E6D8F1]/60 rounded-card space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`px-2.5 py-0.5 rounded-chip font-semibold uppercase text-[11px] border ${getActionColor(
                log.action,
              )}`}
            >
              {log.action}
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {format(date, 'dd MMM yyyy, HH:mm:ss')}
            </span>
          </div>

          <div className="text-sm font-semibold text-ink pt-1">
            Target Entity: {log.entity}
          </div>
        </div>

        {/* Actor Info */}
        <div className="p-4 bg-white border border-[#E6D8F1]/60 rounded-card space-y-2">
          <h4 className="font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
            Actor Information
          </h4>
          <div className="grid grid-cols-2 gap-2 text-ink">
            <div>
              <span className="text-gray-400 block">User Name</span>
              <span className="font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {log.user?.name ?? 'System Process'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Email</span>
              <span className="font-mono text-[11px] text-gray-600">
                {log.user?.email ?? 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">IP Address</span>
              <span className="font-mono text-[11px] flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {log.ipAddress ?? '127.0.0.1'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Actor ID</span>
              <span className="font-mono text-[10px] text-gray-400 truncate block">
                {log.userId ?? 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Target Entity Metadata */}
        <div className="p-4 bg-white border border-[#E6D8F1]/60 rounded-card space-y-2">
          <h4 className="font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
            Target Resource
          </h4>
          <div className="space-y-1 text-ink">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Entity Type:</span>
              <span className="font-medium">{log.entity}</span>
            </div>
            {log.entityId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Entity ID:</span>
                <span className="font-mono text-[11px]">{log.entityId}</span>
              </div>
            )}
            {log.branchId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Branch ID:</span>
                <span className="font-mono text-[11px]">{log.branchId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Payload / Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
              Payload & Change Metadata
            </span>
            <span className="text-[10px] text-gray-400">Sensitive fields sanitized</span>
          </div>

          <pre className="p-3 bg-gray-900 text-green-400 rounded-card font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
            {log.metadata
              ? JSON.stringify(log.metadata, null, 2)
              : '// No additional metadata payload recorded.'}
          </pre>
        </div>
      </div>
    </Drawer>
  );
}

