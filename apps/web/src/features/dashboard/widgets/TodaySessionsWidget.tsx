'use client';

import React from 'react';
import Link from 'next/link';
import { StatusChip } from '@/components/ui';
import { ArrowUpRight } from 'lucide-react';

export interface TodaySessionItem {
  id: string;
  time: string;
  clientName: string;
  clientCode?: string;
  therapy: string;
  therapistName: string;
  status: string;
}

interface TodaySessionsWidgetProps {
  sessions?: TodaySessionItem[];
}

const DEFAULT_SESSIONS: TodaySessionItem[] = [
  { id: '1', time: '09:00 AM', clientName: 'Aadhya Nair', clientCode: 'PN-001', therapy: 'Speech Therapy', therapistName: 'Dr. Ananya S.', status: 'attended' },
  { id: '2', time: '10:00 AM', clientName: 'Vihaan Sharma', clientCode: 'PN-004', therapy: 'Occupational Therapy', therapistName: 'Rajesh M.', status: 'attended' },
  { id: '3', time: '11:00 AM', clientName: 'Arjun Das', clientCode: 'PN-012', therapy: 'Behavioural Therapy', therapistName: 'Kavitha S.', status: 'scheduled' },
  { id: '4', time: '02:00 PM', clientName: 'Diya Patel', clientCode: 'PN-018', therapy: 'Speech Therapy', therapistName: 'Dr. Ananya S.', status: 'scheduled' },
  { id: '5', time: '03:30 PM', clientName: 'Kabir Verma', clientCode: 'PN-022', therapy: 'Special Education', therapistName: 'Priya I.', status: 'cancelled' },
];

export function TodaySessionsWidget({ sessions = DEFAULT_SESSIONS }: TodaySessionsWidgetProps) {
  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E6D8F1]/40 mb-3">
          <div>
            <h3 className="font-quicksand font-bold text-base text-ink">
              Today's Sessions
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live schedule overview for current appointments
            </p>
          </div>
          <Link
            href="/appointments"
            className="text-xs md:text-sm font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>View calendar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Nothing needs attention right now.
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[#E6D8F1]/40 text-gray-500">
                    <th className="py-2.5 font-medium">Time</th>
                    <th className="py-2.5 font-medium">Client / Therapy</th>
                    <th className="py-2.5 font-medium">Therapist</th>
                    <th className="py-2.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6D8F1]/30">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-2.5 font-medium text-ink whitespace-nowrap">
                        {session.time}
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-ink">{session.clientName}</div>
                        <div className="text-xs text-gray-500">{session.therapy}</div>
                      </td>
                      <td className="py-2.5 text-gray-600">
                        {session.therapistName}
                      </td>
                      <td className="py-2.5 text-right">
                        <StatusChip status={session.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-2.5 pt-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 bg-purple-50/30 rounded-btn border border-[#E6D8F1]/40 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-purple-800">
                      {session.time}
                    </div>
                    <div className="text-sm font-bold text-ink">
                      {session.clientName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.therapy} · {session.therapistName}
                    </div>
                  </div>
                  <div>
                    <StatusChip status={session.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
