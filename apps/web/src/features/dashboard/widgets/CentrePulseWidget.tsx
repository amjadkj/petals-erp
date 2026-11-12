'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CentrePulseItem {
  count: number | string;
  title: string;
  hint: string;
  href: string;
}

interface CentrePulseWidgetProps {
  items?: CentrePulseItem[];
  leadFollowupsCount?: number;
  reportsDueCount?: number;
  leaveRequestsCount?: number;
}

export function CentrePulseWidget({
  leadFollowupsCount = 6,
  reportsDueCount = 4,
  leaveRequestsCount = 2,
  items,
}: CentrePulseWidgetProps) {
  const pulseItems: CentrePulseItem[] = items || [
    {
      count: String(leadFollowupsCount).padStart(2, '0'),
      title: 'Lead follow-ups due',
      hint: 'Inquiries awaiting follow-up call today',
      href: '/leads',
    },
    {
      count: String(reportsDueCount).padStart(2, '0'),
      title: 'Reports due this week',
      hint: 'Assessment & milestone progress drafts',
      href: '/reports',
    },
    {
      count: String(leaveRequestsCount).padStart(2, '0'),
      title: 'Leave requests pending',
      hint: 'Staff requests needing Director review',
      href: '/hrms',
    },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="pb-3 border-b border-[#E6D8F1]/40 mb-4">
          <h3 className="font-quicksand font-bold text-base text-ink">
            Centre Pulse
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Operational items that need attention today
          </p>
        </div>

        <div className="divide-y divide-[#E6D8F1]/30">
          {pulseItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between group hover:bg-purple-50/50 -mx-2 px-2 rounded-btn transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 font-quicksand font-bold text-base flex items-center justify-center border border-purple-200/50 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  {item.count}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.hint}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
