'use client';

import React from 'react';
import { StatCard } from '@/components/ui';
import { Send, CheckCheck, AlertOctagon, Gauge } from 'lucide-react';

interface CommunicationStatCardsProps {
  sentToday: number;
  deliveredToday: number;
  failedCount: number;
  dailyCapUsed: number;
  dailyCapLimit?: number;
  loading?: boolean;
}

export function CommunicationStatCards({
  sentToday,
  deliveredToday,
  failedCount,
  dailyCapUsed,
  dailyCapLimit = 500,
  loading = false,
}: CommunicationStatCardsProps) {
  const percentUsed = Math.min(
    100,
    Math.round((dailyCapUsed / dailyCapLimit) * 100),
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Sent Today"
        value={sentToday}
        helper="Across WhatsApp, Email & Calls"
        icon={<Send className="w-5 h-5 text-purple-600" />}
        loading={loading}
      />
      <StatCard
        label="Delivered"
        value={deliveredToday}
        helper={
          sentToday > 0
            ? `${Math.round((deliveredToday / sentToday) * 100)}% delivery rate`
            : 'Confirmed delivery'
        }
        icon={<CheckCheck className="w-5 h-5 text-teal-700" />}
        loading={loading}
      />
      <StatCard
        label="Failed"
        value={failedCount}
        helper={failedCount > 0 ? 'Requires attention' : 'No failed deliveries'}
        icon={<AlertOctagon className="w-5 h-5 text-danger" />}
        loading={loading}
      />
      <StatCard
        label="Daily Cap Used"
        value={`${dailyCapUsed} / ${dailyCapLimit}`}
        helper={`${100 - percentUsed}% quota remaining today`}
        icon={<Gauge className="w-5 h-5" />}
        loading={loading}
      />
    </div>
  );
}

