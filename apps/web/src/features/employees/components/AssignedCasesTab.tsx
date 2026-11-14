'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api/clients';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';
import Link from 'next/link';

export function AssignedCasesTab({ employeeId }: { employeeId: string }) {
  const { data: clientsRes, isLoading } = useQuery({
    queryKey: ['employee-clients', employeeId],
    queryFn: () => clientsApi.getClients({ primaryTherapistId: employeeId }),
    enabled: !!employeeId,
  });

  const cases = useMemo(() => {
    if (!clientsRes?.data || clientsRes.data.length === 0) return [];
    return clientsRes.data;
  }, [clientsRes]);

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E6D8F1]/50">
        <div>
          <h3 className="font-quicksand font-bold text-lg text-purple-600">
            Assigned Therapy Cases
          </h3>
          <p className="text-xs text-gray-500">
            Active client caseload where this clinician is designated as primary therapist
          </p>
        </div>
        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-chip border border-[#E6D8F1]">
          {cases.length} Active Cases
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded-card animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-card animate-pulse" />
        </div>
      ) : cases.length > 0 ? (
        <div className="space-y-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="p-4 border border-[#E6D8F1]/80 rounded-card bg-white space-y-3 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/clients/${c.id}`}
                    className="font-semibold text-ink text-base hover:text-purple-600 transition-colors"
                  >
                    {c.name}
                  </Link>
                  <span className="text-xs font-mono text-gray-400 ml-2">
                    {c.clientCode || 'PTL-C---'}
                  </span>
                </div>
                <StatusChip
                  status={c.status === 'ACTIVE' ? 'active' : 'cancelled'}
                  label={c.status}
                />
              </div>

              <div className="text-sm text-gray-800">
                <span className="text-gray-500 text-xs">Primary Guardian: </span>
                <span className="text-xs font-medium text-ink">
                  {c.primaryGuardian?.name || 'Guardian not listed'}
                </span>
                {c.primaryGuardian?.phone && (
                  <span className="text-xs text-gray-500 ml-1">
                    · {c.primaryGuardian.phone}
                  </span>
                )}
              </div>

              {c.caseHistory && (
                <div className="bg-purple-50/50 rounded-btn p-3 text-xs space-y-1.5 text-gray-700">
                  <div>
                    <strong className="text-ink">Case History: </strong>
                    {c.caseHistory}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8 text-purple-600 stroke-[1.5]" />}
          headline="No Cases Assigned"
          hint="This team member is not designated as the primary therapist for any clients at present."
        />
      )}
    </div>
  );
}
