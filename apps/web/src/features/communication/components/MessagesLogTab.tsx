'use client';

import React, { useState, useMemo } from 'react';
import {
  StatusChip,
  Input,
  Select,
  EmptyState,
} from '@/components/ui';
import { CommunicationChannel, MessageStatus } from '@petals/types';
import type { CommunicationLogDto, MessageFilterState } from '../types';
import { MessageDetailDrawer } from './MessageDetailDrawer';
import {
  Search,
  MessageSquare,
  Mail,
  PhoneCall,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

interface MessagesLogTabProps {
  messages: CommunicationLogDto[];
  isLoading?: boolean;
}

export function MessagesLogTab({
  messages,
  isLoading = false,
}: MessagesLogTabProps) {
  const [selectedMessage, setSelectedMessage] = useState<CommunicationLogDto | null>(null);
  const [filters, setFilters] = useState<MessageFilterState>({
    search: '',
    channel: '',
    status: '',
    date: '',
  });

  const getChannelIcon = (ch: CommunicationChannel) => {
    switch (ch) {
      case CommunicationChannel.WHATSAPP:
        return (
          <span title="WhatsApp">
            <MessageSquare className="w-4 h-4 text-success" />
          </span>
        );
      case CommunicationChannel.EMAIL:
        return (
          <span title="Email">
            <Mail className="w-4 h-4 text-purple-600" />
          </span>
        );
      case CommunicationChannel.CALL:
        return (
          <span title="Call">
            <PhoneCall className="w-4 h-4 text-teal-700" />
          </span>
        );
    }
  };

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const clientName = m.client?.name?.toLowerCase() ?? '';
        const guardianName = m.client?.primaryGuardian?.name?.toLowerCase() ?? '';
        const recipient = m.recipient.toLowerCase();
        const body = m.message?.toLowerCase() ?? '';
        if (
          !clientName.includes(q) &&
          !guardianName.includes(q) &&
          !recipient.includes(q) &&
          !body.includes(q)
        ) {
          return false;
        }
      }

      if (filters.channel && m.channel !== filters.channel) {
        return false;
      }

      if (filters.status && m.status !== filters.status) {
        return false;
      }

      if (filters.date) {
        const d = m.sentAt ? m.sentAt.split('T')[0] : '';
        if (d !== filters.date) return false;
      }

      return true;
    });
  }, [messages, filters]);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search client, guardian, phone..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            leadingIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="h-10 text-sm"
          />

          <Select
            value={filters.channel}
            onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
            className="h-10 text-sm"
            options={[
              { value: '', label: 'All Channels' },
              { value: CommunicationChannel.WHATSAPP, label: 'WhatsApp' },
              { value: CommunicationChannel.EMAIL, label: 'Email' },
              { value: CommunicationChannel.CALL, label: 'Phone Call' },
            ]}
          />

          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="h-10 text-sm"
            options={[
              { value: '', label: 'All Statuses' },
              { value: MessageStatus.QUEUED, label: 'Queued' },
              { value: MessageStatus.SENT, label: 'Sent' },
              { value: MessageStatus.DELIVERED, label: 'Delivered' },
              { value: MessageStatus.READ, label: 'Read' },
              { value: MessageStatus.FAILED, label: 'Failed' },
            ]}
          />

          <Input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="h-10 text-sm"
          />
        </div>
      </div>

      {/* Messages table */}
      {isLoading ? (
        <div className="bg-white border border-[#E6D8F1]/40 rounded-card p-6 space-y-4 animate-pulse">
          <div className="h-10 bg-purple-50 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-8">
          <EmptyState
            headline="No communication logs found"
            hint="Sent messages and recorded call logs will appear here."
          />
        </div>
      ) : (
        <div className="w-full space-y-3">
          {/* Desktop View */}
          <div className="hidden md:block bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-50 border-b border-[#E6D8F1]/60 h-11 text-[12px] font-semibold text-gray-600 uppercase tracking-wider select-none">
                    <th className="px-4">Client (Guardian)</th>
                    <th className="px-4">Channel</th>
                    <th className="px-4">Template / Subject</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Sent By</th>
                    <th className="px-4">Time</th>
                    <th className="w-8 px-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6D8F1]/30">
                  {filtered.map((item) => {
                    const sentDate = item.sentAt ? new Date(item.sentAt) : new Date();

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedMessage(item)}
                        className="h-[52px] hover:bg-purple-50/50 cursor-pointer transition-colors group"
                      >
                        {/* Client / Guardian */}
                        <td className="px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-ink text-sm group-hover:text-purple-600 transition-colors">
                              {item.client?.name ?? 'Client'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {item.client?.primaryGuardian?.name
                                ? `${item.client.primaryGuardian.name} (${item.client.primaryGuardian.relation})`
                                : item.recipient}
                            </span>
                          </div>
                        </td>

                        {/* Channel Icon */}
                        <td className="px-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700 capitalize font-medium">
                            {getChannelIcon(item.channel)}
                            <span>{item.channel.toLowerCase()}</span>
                          </div>
                        </td>

                        {/* Template / Preview */}
                        <td className="px-4 max-w-xs">
                          <span className="text-sm text-ink truncate block">
                            {item.template?.name ?? (item.message ? item.message.slice(0, 40) + '...' : 'Transactional')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4">
                          <StatusChip status={item.status} />
                        </td>

                        {/* Sent by */}
                        <td className="px-4 text-xs text-gray-600">
                          {item.sentBy?.name ?? 'System'}
                        </td>

                        {/* Time */}
                        <td className="px-4 text-xs text-gray-500 whitespace-nowrap">
                          {format(sentDate, 'dd MMM, HH:mm')}
                        </td>

                        {/* Chevron */}
                        <td className="px-2 text-gray-400 group-hover:text-purple-600">
                          <ChevronRight className="w-4 h-4" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filtered.map((item) => {
              const sentDate = item.sentAt ? new Date(item.sentAt) : new Date();

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMessage(item)}
                  className="p-4 bg-white border border-[#E6D8F1]/60 rounded-card space-y-2.5 cursor-pointer hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(item.channel)}
                      <div>
                        <h4 className="font-semibold text-ink text-sm">
                          {item.client?.name ?? 'Client'}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {item.client?.primaryGuardian?.name ?? item.recipient}
                        </p>
                      </div>
                    </div>
                    <StatusChip status={item.status} />
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
                    {item.message ?? item.template?.name ?? 'Notification'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(sentDate, 'dd MMM, HH:mm')}
                    </span>
                    <span className="text-purple-600 flex items-center gap-0.5">
                      View details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <MessageDetailDrawer
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
      />
    </div>
  );
}
