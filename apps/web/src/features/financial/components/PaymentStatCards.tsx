'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { formatINRLakhs, formatINR } from '@/lib/formatters';
import { CheckCircle2, Clock, ShieldCheck, TrendingUp } from 'lucide-react';

interface PaymentStatCardsProps {
  paidThisMonth?: number;
  pendingAmount?: number;
  pendingCount?: number;
  overdueCount?: number;
  advanceBalance?: number;
  receivedThisWeek?: number;
  isLoading?: boolean;
}

export function PaymentStatCards({
  paidThisMonth = 372000,
  pendingAmount = 48000,
  pendingCount = 12,
  overdueCount = 3,
  advanceBalance = 22000,
  receivedThisWeek = 105000,
  isLoading = false,
}: PaymentStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Paid this month"
        value={formatINRLakhs(paidThisMonth)}
        helper="Across all active clients"
        icon={<CheckCircle2 className="w-5 h-5 text-success" />}
        loading={isLoading}
      />
      <StatCard
        label="Pending payments"
        value={formatINR(pendingAmount)}
        helper={`${pendingCount} families · ${overdueCount} overdue`}
        icon={<Clock className="w-5 h-5 text-warning" />}
        loading={isLoading}
      />
      <StatCard
        label="Advance balance"
        value={formatINR(advanceBalance)}
        helper="Credit towards future sessions"
        icon={<ShieldCheck className="w-5 h-5 text-teal-700" />}
        loading={isLoading}
      />
      <StatCard
        label="Received this week"
        value={formatINRLakhs(receivedThisWeek)}
        helper="+8% vs last week"
        icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        loading={isLoading}
      />
    </div>
  );
}
