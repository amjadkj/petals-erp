'use client';

import React from 'react';
import Link from 'next/link';
import { StatusChip, Button } from '@/components/ui';
import { ArrowLeft, Edit, MessageSquare, Calendar, User } from 'lucide-react';
import { ClientProfileHeader } from '@/lib/api/clients';
import { calculateAge, getInitials, getAvatarColorClass } from '@/lib/utils';

interface ProfileHeaderProps {
  client: ClientProfileHeader;
  branchName?: string;
  onEdit: () => void;
}

export function ProfileHeader({
  client,
  branchName = 'Indiranagar Main',
  onEdit,
}: ProfileHeaderProps) {
  const age = calculateAge(client.dob);
  const initials = getInitials(client.name);
  const avatarColor = getAvatarColorClass(client.name || client.id);

  const departments = client.departments || [
    { id: '1', name: 'Speech Therapy', code: 'ST' },
    { id: '2', name: 'Occupational Therapy', code: 'OT' },
  ];

  const therapists = client.therapists || [
    { id: '1', name: 'Dr. Ananya Sharma', designation: 'Senior Speech Therapist' },
    { id: '2', name: 'Rajesh Menon', designation: 'Occupational Therapist' },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
        <Link
          href="/clients"
          className="flex items-center gap-1 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Clients</span>
        </Link>
        <span>/</span>
        <span className="text-ink font-semibold">{client.name}</span>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Client Details */}
          <div className="flex items-start md:items-center gap-4">
            <div
              className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-quicksand font-bold text-lg md:text-xl shrink-0 ${avatarColor}`}
            >
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-quicksand font-bold text-xl md:text-2xl text-ink">
                  {client.name}
                </h1>
                <span className="text-xs md:text-sm font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {client.clientCode || 'PN-001'}
                </span>
                <StatusChip status={client.status || 'ACTIVE'} />
              </div>

              <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 font-medium mt-1.5 flex-wrap">
                <span>Age: <strong className="text-ink">{age}</strong></span>
                <span>·</span>
                <span>Branch: <strong className="text-ink">{branchName}</strong></span>
                {client.gender && (
                  <>
                    <span>·</span>
                    <span className="capitalize">{client.gender.toLowerCase()}</span>
                  </>
                )}
                {client.bloodGroup && (
                  <>
                    <span>·</span>
                    <span>Blood: <strong className="text-ink">{client.bloodGroup}</strong></span>
                  </>
                )}
              </div>

              {/* Department Chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {departments.map((dept) => (
                  <span
                    key={dept.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-chip text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200"
                  >
                    {dept.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section: Therapists Avatars & Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-4">
            {/* Assigned Care Team */}
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider mb-1">
                Care Team
              </span>
              <div className="flex items-center -space-x-2">
                {therapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white text-purple-800 flex items-center justify-center font-bold text-xs shadow-sm"
                    title={`${therapist.name} (${therapist.designation || 'Therapist'})`}
                  >
                    {getInitials(therapist.name)}
                  </div>
                ))}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={onEdit}
                className="h-9 px-3 text-xs md:text-sm flex items-center gap-1.5 border-purple-200 text-purple-800 hover:bg-purple-50"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>

              <Link href={`/communication?clientId=${client.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-3 text-xs md:text-sm flex items-center gap-1.5 border-purple-200 text-purple-800 hover:bg-purple-50"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send message</span>
                </Button>
              </Link>

              <Link href={`/appointments?clientId=${client.id}&openNew=true`}>
                <Button
                  type="button"
                  variant="primary"
                  className="h-9 px-3.5 text-xs md:text-sm flex items-center gap-1.5 font-semibold"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule session</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
