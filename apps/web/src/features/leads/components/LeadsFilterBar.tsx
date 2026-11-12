'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Search } from 'lucide-react';

interface LeadsFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sourceFilter: string;
  onSourceChange: (val: string) => void;
  ownerFilter: string;
  onOwnerChange: (val: string) => void;
  viewMode: 'board' | 'list';
  onViewModeChange: (val: 'board' | 'list') => void;
  owners?: string[];
}

export function LeadsFilterBar({
  searchQuery,
  onSearchChange,
  sourceFilter,
  onSourceChange,
  ownerFilter,
  onOwnerChange,
  viewMode,
  onViewModeChange,
  owners = ['Nikhil Kumar', 'Priya Nair', 'Anita Sen'],
}: LeadsFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-[#E6D8F1]/60 rounded-card p-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
        <Input
          placeholder="Search child, parent, phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<Search className="w-4 h-4" />}
          className="h-10 text-xs"
        />

        <Select
          value={sourceFilter}
          onChange={(e) => onSourceChange(e.target.value)}
          className="h-10 text-xs"
          options={[
            { value: 'ALL', label: 'All sources' },
            { value: 'Website', label: 'Website' },
            { value: 'Referral', label: 'Referral' },
            { value: 'School referral', label: 'School referral' },
            { value: 'Instagram', label: 'Instagram' },
            { value: 'Paediatrician', label: 'Paediatrician' },
            { value: 'Walk-in', label: 'Walk-in' },
            { value: 'Other', label: 'Other' },
          ]}
        />

        <Select
          value={ownerFilter}
          onChange={(e) => onOwnerChange(e.target.value)}
          className="h-10 text-xs"
        >
          <option value="ALL">All owners</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-end">
        <SegmentedControl
          value={viewMode}
          onChange={(v) => onViewModeChange(v as 'board' | 'list')}
          options={[
            { value: 'board', label: 'Board' },
            { value: 'list', label: 'List' },
          ]}
        />
      </div>
    </div>
  );
}
