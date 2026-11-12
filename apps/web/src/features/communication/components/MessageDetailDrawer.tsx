'use client';

import React from 'react';
import { Drawer, StatusChip } from '@/components/ui';
import type { CommunicationLogDto } from '../types';
import { CommunicationChannel } from '@petals/types';
import {
  MessageSquare,
  Mail,
  PhoneCall,
  User,
  Calendar,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import { format } from 'date-fns';

interface MessageDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  message: CommunicationLogDto | null;
}

export function MessageDetailDrawer({
  isOpen,
  onClose,
  message,
}: MessageDetailDrawerProps) {
  if (!message) return null;

  const sentDate = message.sentAt ? new Date(message.sentAt) : new Date();

  const getChannelIcon = (ch: CommunicationChannel) => {
    switch (ch) {
      case CommunicationChannel.WHATSAPP:
        return <MessageSquare className="w-4 h-4 text-success" />;
      case CommunicationChannel.EMAIL:
        return <Mail className="w-4 h-4 text-purple-600" />;
      case CommunicationChannel.CALL:
        return <PhoneCall className="w-4 h-4 text-teal-700" />;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {getChannelIcon(message.channel)}
          <span>Message Details</span>
        </div>
      }
      width="max-w-[460px]"
    >
      <div className="space-y-5">
        {/* Status Header */}
        <div className="p-4 bg-purple-50/60 border border-[#E6D8F1]/60 rounded-card flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Delivery Status</span>
            <span className="text-sm font-semibold text-ink capitalize">
              {message.status.toLowerCase()}
            </span>
          </div>
          <StatusChip status={message.status} />
        </div>

        {/* Client & Recipient Information */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recipient
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-gray-400 block">Client</span>
              <span className="font-medium text-ink">
                {message.client?.name ?? 'Client'}
              </span>
              <span className="text-xs text-gray-400 block">
                {message.client?.clientCode ?? ''}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-400 block">Guardian</span>
              <span className="font-medium text-ink">
                {message.client?.primaryGuardian?.name ?? 'Guardian'}
              </span>
              <span className="text-xs text-gray-400 block">
                {message.client?.primaryGuardian?.relation ?? ''}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-400 block">Destination</span>
              <span className="font-mono text-xs text-ink">
                {message.recipient}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-400 block">Channel</span>
              <span className="font-medium text-ink capitalize">
                {message.channel.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Message Content Bubble */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Message Body
          </h3>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-btn text-sm text-ink whitespace-pre-wrap font-sans leading-relaxed">
            {message.message ?? 'No text content recorded.'}
          </div>
        </div>

        {/* Metadata Details */}
        <div className="bg-white border border-[#E6D8F1]/40 rounded-card p-4 space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Sent By
            </span>
            <span className="font-medium text-ink">
              {message.sentBy?.name ?? 'System'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Sent At
            </span>
            <span className="font-medium text-ink">
              {format(sentDate, 'dd MMM yyyy, HH:mm:ss')}
            </span>
          </div>

          {message.template && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                Template
              </span>
              <span className="font-medium text-purple-600">
                {message.template.name}
              </span>
            </div>
          )}

          {message.providerRef && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                Provider Ref
              </span>
              <span className="font-mono text-[11px] text-gray-600">
                {message.providerRef}
              </span>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

