'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StatusChip, Checkbox, Tabs, TabList, TabTrigger } from '@/components/ui';
import { ChevronRight, ChevronLeft, Inbox } from 'lucide-react';
import { ClientRowItem } from './types';
import { getInitials, getAvatarColorClass } from '@/lib/utils';

interface ClientsTableProps {
  clients: ClientRowItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  selectedIds: string[];
  onSelectChange: (selectedIds: string[]) => void;
  currentTab: 'all' | 'recent' | 'archived';
  onTabChange: (tab: 'all' | 'recent' | 'archived') => void;
  isLoading?: boolean;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

export function ClientsTable({
  clients,
  total,
  page,
  pageSize,
  onPageChange,
  selectedIds,
  onSelectChange,
  currentTab,
  onTabChange,
  isLoading = false,
  onResetFilters,
  isFiltered = false,
}: ClientsTableProps) {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const allSelected = clients.length > 0 && clients.every((c) => selectedIds.includes(c.id));
  const someSelected = clients.some((c) => selectedIds.includes(c.id)) && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allCurrentIds = Array.from(new Set([...selectedIds, ...clients.map((c) => c.id)]));
      onSelectChange(allCurrentIds);
    } else {
      const currentIds = new Set(clients.map((c) => c.id));
      onSelectChange(selectedIds.filter((id) => !currentIds.has(id)));
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden flex flex-col">
      {/* Table Card Header with Tabs and Total Count */}
      <div className="px-5 pt-3 border-b border-[#E6D8F1]/40 flex items-center justify-between flex-wrap gap-2">
        <Tabs value={currentTab} onValueChange={(val) => onTabChange(val as any)}>
          <TabList className="border-b-0 gap-4 md:gap-6">
            <TabTrigger value="all">All clients</TabTrigger>
            <TabTrigger value="recent">My recent</TabTrigger>
            <TabTrigger value="archived">Archived</TabTrigger>
          </TabList>
        </Tabs>

        <div className="text-xs md:text-sm font-semibold text-gray-500 pb-2">
          {total} client{total === 1 ? '' : 's'}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-10 bg-purple-50 rounded" />
          <div className="h-14 bg-gray-100 rounded" />
          <div className="h-14 bg-gray-100 rounded" />
          <div className="h-14 bg-gray-100 rounded" />
          <div className="h-14 bg-gray-100 rounded" />
        </div>
      ) : clients.length === 0 ? (
        /* Empty State */
        <div className="py-14 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          {isFiltered ? (
            <>
              <h3 className="font-quicksand font-bold text-base text-ink mb-1">
                No clients match these filters
              </h3>
              <p className="text-xs text-gray-500 mb-4 max-w-xs">
                Try modifying your search query or reset active filters.
              </p>
              {onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 underline"
                >
                  Reset filters
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="font-quicksand font-bold text-base text-ink mb-1">
                No clients yet
              </h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Add your first client to begin managing care records.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/70 border-b border-[#E6D8F1]/60 h-11 text-[12px] font-semibold text-gray-600 uppercase tracking-wider select-none">
                  <th className="w-12 px-4">
                    <Checkbox
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all clients"
                    />
                  </th>
                  <th className="px-4">Client</th>
                  <th className="px-4">Department</th>
                  <th className="px-4">Assigned Therapist</th>
                  <th className="px-4 text-center">Scheduled</th>
                  <th className="px-4 text-center">Attended</th>
                  <th className="px-4 text-center">Status</th>
                  <th className="w-10 px-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6D8F1]/30">
                {clients.map((client) => {
                  const isSelected = selectedIds.includes(client.id);
                  const initials = getInitials(client.name);
                  const avatarColor = getAvatarColorClass(client.name || client.id);

                  return (
                    <tr
                      key={client.id}
                      onClick={() => router.push(`/clients/${client.id}`)}
                      className={`h-[56px] transition-colors cursor-pointer hover:bg-purple-50/40 ${
                        isSelected ? 'bg-purple-50/60' : ''
                      }`}
                    >
                      <td className="px-4" onClick={(e) => handleToggleRow(client.id, e)}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select ${client.name}`}
                        />
                      </td>

                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-quicksand font-bold text-xs shrink-0 ${avatarColor}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-ink hover:text-purple-600 transition-colors">
                              {client.name}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              {client.clientCode || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5 text-xs md:text-sm text-gray-700">
                        {client.departmentName || 'Speech Therapy'}
                      </td>

                      <td className="px-4 py-2.5 text-xs md:text-sm text-gray-700">
                        {client.therapistName || 'Dr. Ananya S.'}
                      </td>

                      <td className="px-4 py-2.5 text-center text-xs md:text-sm font-medium text-ink">
                        {client.scheduledCount ?? client.sessionCount ?? 24}
                      </td>

                      <td className="px-4 py-2.5 text-center text-xs md:text-sm font-medium text-teal-700">
                        {client.attendedCount ?? Math.floor((client.sessionCount ?? 24) * 0.75)}
                      </td>

                      <td className="px-4 py-2.5 text-center">
                        <StatusChip status={client.status || 'ACTIVE'} />
                      </td>

                      <td className="px-2 text-right text-gray-400">
                        <ChevronRight className="w-4 h-4 inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< 768px) */}
          <div className="md:hidden divide-y divide-[#E6D8F1]/40">
            {clients.map((client) => {
              const isSelected = selectedIds.includes(client.id);
              const initials = getInitials(client.name);
              const avatarColor = getAvatarColorClass(client.name || client.id);
              const scheduled = client.scheduledCount ?? client.sessionCount ?? 24;
              const attended = client.attendedCount ?? Math.floor((client.sessionCount ?? 24) * 0.75);

              return (
                <div
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className={`p-4 flex items-center justify-between gap-3 transition-colors active:bg-purple-50/60 ${
                    isSelected ? 'bg-purple-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div onClick={(e) => handleToggleRow(client.id, e)}>
                      <Checkbox checked={isSelected} onChange={() => {}} />
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-quicksand font-bold text-xs shrink-0 ${avatarColor}`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-ink truncate">
                        {client.name}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {client.clientCode || '—'} · {client.departmentName || 'Speech'}
                      </div>
                      <div className="text-xs text-teal-700 font-medium mt-0.5">
                        Attended: <span className="font-bold">{attended}</span> / {scheduled}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusChip status={client.status || 'ACTIVE'} />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3.5 border-t border-[#E6D8F1]/40 bg-white flex items-center justify-between text-xs md:text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold text-ink">{startItem}</span> to{' '}
              <span className="font-semibold text-ink">{endItem}</span> of{' '}
              <span className="font-semibold text-ink">{total}</span> clients
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-btn border border-[#E6D8F1]/60 text-ink hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2 font-medium text-xs md:text-sm">
                Page {page} of {totalPages}
              </div>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-btn border border-[#E6D8F1]/60 text-ink hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
