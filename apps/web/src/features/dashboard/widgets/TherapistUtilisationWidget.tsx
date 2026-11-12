'use client';

import React from 'react';
import { ProgressBar } from '@/components/ui';

interface TherapistUtilisationRow {
  id: string;
  name: string;
  department: string;
  bookedHours: number;
  totalHours: number;
}

interface TherapistUtilisationWidgetProps {
  data?: TherapistUtilisationRow[];
}

const DEFAULT_THERAPISTS: TherapistUtilisationRow[] = [
  { id: '1', name: 'Dr. Ananya Sharma', department: 'Speech Therapy', bookedHours: 6.5, totalHours: 8 },
  { id: '2', name: 'Rajesh Menon', department: 'Occupational Therapy', bookedHours: 5.0, totalHours: 8 },
  { id: '3', name: 'Kavitha Sundaram', department: 'Behavioural Therapy', bookedHours: 7.0, totalHours: 8 },
  { id: '4', name: 'Priya Iyer', department: 'Special Education', bookedHours: 4.5, totalHours: 8 },
];

export function TherapistUtilisationWidget({ data = DEFAULT_THERAPISTS }: TherapistUtilisationWidgetProps) {
  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E6D8F1]/40 mb-4">
          <div>
            <h3 className="font-quicksand font-bold text-base text-ink">
              Therapist Utilisation
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Booked hours out of 8 available today
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
              Booked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-200 inline-block" />
              Available
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {data.map((therapist) => (
            <div key={therapist.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{therapist.name}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500 text-xs">{therapist.department}</span>
                </div>
                <span className="font-medium text-purple-800 text-xs md:text-sm">
                  {therapist.bookedHours} / {therapist.totalHours}h
                </span>
              </div>
              <ProgressBar
                value={therapist.bookedHours}
                max={therapist.totalHours}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
