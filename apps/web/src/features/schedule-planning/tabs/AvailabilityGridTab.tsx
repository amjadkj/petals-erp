'use client';

import React, { useState } from 'react';
import { DatePicker } from '@/components/ui';
import { TherapistAvailabilityRow } from '../types';
import { Clock } from 'lucide-react';

interface AvailabilityGridTabProps {
  data?: TherapistAvailabilityRow[];
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const DEFAULT_THERAPISTS_AVAILABILITY: TherapistAvailabilityRow[] = [
  {
    therapistId: 't1',
    therapistName: 'Dr. Ananya Sharma',
    department: 'Speech Therapy',
    slots: [
      { hour: 9, status: 'booked', details: 'Aadhya Nair' },
      { hour: 10, status: 'booked', details: 'Arjun Das' },
      { hour: 11, status: 'free' },
      { hour: 12, status: 'free' },
      { hour: 13, status: 'free' },
      { hour: 14, status: 'booked', details: 'Diya Patel' },
      { hour: 15, status: 'free' },
      { hour: 16, status: 'other_branch', details: 'Busy at Whitefield' },
      { hour: 17, status: 'other_branch', details: 'Busy at Whitefield' },
    ],
  },
  {
    therapistId: 't2',
    therapistName: 'Rajesh Menon',
    department: 'Occupational Therapy',
    slots: [
      { hour: 9, status: 'free' },
      { hour: 10, status: 'booked', details: 'Vihaan Sharma' },
      { hour: 11, status: 'booked', details: 'Kabir Verma' },
      { hour: 12, status: 'free' },
      { hour: 13, status: 'free' },
      { hour: 14, status: 'free' },
      { hour: 15, status: 'booked', details: 'Rohan Sen' },
      { hour: 16, status: 'free' },
      { hour: 17, status: 'free' },
    ],
  },
  {
    therapistId: 't3',
    therapistName: 'Kavitha Sundaram',
    department: 'Behavioural Therapy',
    slots: [
      { hour: 9, status: 'leave', details: 'On Casual Leave' },
      { hour: 10, status: 'leave', details: 'On Casual Leave' },
      { hour: 11, status: 'leave', details: 'On Casual Leave' },
      { hour: 12, status: 'leave', details: 'On Casual Leave' },
      { hour: 13, status: 'leave', details: 'On Casual Leave' },
      { hour: 14, status: 'leave', details: 'On Casual Leave' },
      { hour: 15, status: 'leave', details: 'On Casual Leave' },
      { hour: 16, status: 'leave', details: 'On Casual Leave' },
      { hour: 17, status: 'leave', details: 'On Casual Leave' },
    ],
  },
  {
    therapistId: 't4',
    therapistName: 'Priya Iyer',
    department: 'Special Education',
    slots: [
      { hour: 9, status: 'booked', details: 'Dev K.' },
      { hour: 10, status: 'free' },
      { hour: 11, status: 'booked', details: 'Zoya M.' },
      { hour: 12, status: 'free' },
      { hour: 13, status: 'free' },
      { hour: 14, status: 'free' },
      { hour: 15, status: 'booked', details: 'Meera S.' },
      { hour: 16, status: 'booked', details: 'Aryan P.' },
      { hour: 17, status: 'free' },
    ],
  },
];

export function AvailabilityGridTab({ data = DEFAULT_THERAPISTS_AVAILABILITY }: AvailabilityGridTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roomView, setRoomView] = useState(false);

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden space-y-4 p-5">
      {/* Top Controls: Date & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6D8F1]/40">
        <div>
          <h3 className="font-quicksand font-bold text-base text-ink">
            {roomView ? 'Room Occupancy Grid' : 'Therapist Availability Grid'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time cross-branch booking density and clinician time slots
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <DatePicker
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setRoomView((prev) => !prev)}
            className="px-3 py-2 rounded-btn text-xs font-semibold border border-purple-200 text-purple-800 hover:bg-purple-50 transition-colors whitespace-nowrap"
          >
            {roomView ? 'View Therapists' : 'View Rooms'}
          </button>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 flex-wrap pb-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
          Booked session
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" />
          Available (Free)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-200 border border-gray-400 inline-block" />
          Leave / Holiday
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
          Busy at other branch
        </span>
      </div>

      {/* Grid Canvas */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-purple-50/70 border-b border-[#E6D8F1]/60 h-10 text-[11px] font-semibold text-gray-600 uppercase tracking-wider select-none">
              <th className="px-4 w-52">Therapist / Dept</th>
              {HOURS.map((h) => (
                <th key={h} className="px-1 text-center font-medium">
                  {String(h).padStart(2, '0')}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6D8F1]/30">
            {data.map((therapist) => (
              <tr key={therapist.therapistId} className="h-14 hover:bg-purple-50/20 transition-colors">
                <td className="px-4 py-2">
                  <div className="font-semibold text-xs text-ink">{therapist.therapistName}</div>
                  <div className="text-[11px] text-gray-500">{therapist.department}</div>
                </td>

                {HOURS.map((hour) => {
                  const slot = therapist.slots.find((s) => s.hour === hour);
                  const status = slot?.status || 'free';
                  const details = slot?.details || '';

                  let bg = 'bg-white border-dashed border-gray-200 text-transparent';
                  if (status === 'booked') {
                    bg = 'bg-purple-100 border-purple-300 text-purple-900';
                  } else if (status === 'leave') {
                    bg = 'bg-gray-100 border-gray-300 text-gray-600 line-through';
                  } else if (status === 'other_branch') {
                    bg = 'bg-amber-50 border-amber-300 text-amber-800';
                  }

                  return (
                    <td key={hour} className="px-1 py-1.5">
                      <div
                        className={`h-11 rounded border p-1 text-[10px] leading-tight flex flex-col justify-center items-center text-center font-medium transition-colors select-none ${bg}`}
                        title={details || `${hour}:00 - Available`}
                      >
                        {status === 'booked' && (
                          <span className="truncate max-w-[64px] font-bold">{details}</span>
                        )}
                        {status === 'other_branch' && (
                          <span className="truncate max-w-[64px] font-semibold text-[9px]">Whitefield</span>
                        )}
                        {status === 'leave' && (
                          <span className="truncate max-w-[64px] text-[9px]">Leave</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Multi-Branch Note */}
      <div className="pt-2 text-xs text-gray-500 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-purple-600" />
        <span>A therapist practicing across multiple centres shows unified combined availability.</span>
      </div>
    </div>
  );
}
