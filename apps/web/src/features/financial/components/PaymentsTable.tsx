'use client';

import React, { useState, useMemo } from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusChip } from '@/components/ui/StatusChip';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { formatINR, formatDateSafe } from '@/lib/formatters';
import { InvoiceStatus, PaymentMethod } from '@petals/types';
import { Search, FileDown, BellRing, Filter } from 'lucide-react';
import type { PaymentRow } from '../types';

interface PaymentsTableProps {
  payments: PaymentRow[];
  isLoading?: boolean;
  onSendReminder?: (payment: PaymentRow) => void;
  onDownloadReceipt?: (payment: PaymentRow) => void;
}

export function PaymentsTable({
  payments,
  isLoading = false,
  onSendReminder,
  onDownloadReceipt,
}: PaymentsTableProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ADVANCE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return payments.filter((item) => {
      // Tab filter
      if (activeTab === 'PENDING' && item.status !== InvoiceStatus.PENDING) return false;
      if (activeTab === 'ADVANCE' && item.status !== InvoiceStatus.ADVANCE) return false;

      // Method filter
      if (methodFilter !== 'ALL' && item.method !== methodFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = item.clientName.toLowerCase().includes(q);
        const matchesReceipt = item.receiptNumber?.toLowerCase().includes(q);
        if (!matchesClient && !matchesReceipt) return false;
      }

      return true;
    });
  }, [payments, activeTab, methodFilter, statusFilter, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const handleDownloadPdf = (payment: PaymentRow) => {
    if (onDownloadReceipt) {
      onDownloadReceipt(payment);
    } else {
      showToast(`Downloading receipt ${payment.receiptNumber || 'PTL-REC'} (PDF)`, 'info');
    }
  };

  const handleRemind = (payment: PaymentRow) => {
    if (onSendReminder) {
      onSendReminder(payment);
    } else {
      showToast(`Reminder sent to ${payment.clientName}`, 'success');
    }
  };

  const columns: Column<PaymentRow>[] = [
    {
      key: 'clientName',
      header: 'Client',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.clientName}</span>
          {row.dueDate && row.status === InvoiceStatus.PENDING && (
            <span className="block text-[11px] text-danger">Due {formatDateSafe(row.dueDate)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      isSecondary: true,
      render: (row) => (
        <span className="text-gray-600 text-sm">{formatDateSafe(row.date)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      isSecondary: true,
      render: (row) => (
        <span className="font-semibold text-ink text-sm">{formatINR(row.amount)}</span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      isSecondary: true,
      render: (row) => {
        if (row.status === InvoiceStatus.PENDING || !row.method) {
          return <span className="text-gray-400">—</span>;
        }
        return <span className="text-gray-700 capitalize text-sm">{String(row.method).toLowerCase().replace('_', ' ')}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      isStatus: true,
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      key: 'receiptNumber',
      header: 'Receipt',
      render: (row) => {
        if (row.status === InvoiceStatus.PENDING || !row.receiptNumber) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadPdf(row);
            }}
            className="text-purple-600 hover:text-purple-800 font-medium text-xs hover:underline"
          >
            {row.receiptNumber}
          </button>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => {
        if (row.status === InvoiceStatus.PAID || row.status === InvoiceStatus.ADVANCE) {
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadPdf(row);
              }}
              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium p-1 hover:bg-purple-50 rounded"
              title="Download Receipt PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>↓ PDF</span>
            </button>
          );
        }
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemind(row);
            }}
            className="inline-flex items-center gap-1 text-xs text-warning hover:text-warning/80 font-medium p-1 hover:bg-warning-bg rounded"
            title="Send reminder"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Remind</span>
          </button>
        );
      },
    },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      {/* Header with tabs and month indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6D8F1]/60 pb-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'ADVANCE'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels = {
              ALL: 'All payments',
              PENDING: 'Pending',
              ADVANCE: 'Advance',
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-btn transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-gray-500 hover:text-ink'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
        <div className="text-xs font-medium text-gray-500">
          Showing records for current billing cycle
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Search client or receipt..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          leadingIcon={<Search className="w-4 h-4" />}
          className="h-10 text-xs"
        />

        <Select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 text-xs"
          leadingIcon={<Filter className="w-4 h-4" />}
          options={[
            { value: 'ALL', label: 'All payment methods' },
            { value: PaymentMethod.CASH, label: 'Cash' },
            { value: PaymentMethod.UPI, label: 'UPI' },
            { value: PaymentMethod.CARD, label: 'Card' },
            { value: PaymentMethod.BANK_TRANSFER, label: 'Bank transfer' },
          ]}
        />

        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 text-xs"
          options={[
            { value: 'ALL', label: 'All statuses' },
            { value: InvoiceStatus.PAID, label: 'Paid' },
            { value: InvoiceStatus.PENDING, label: 'Pending' },
            { value: InvoiceStatus.ADVANCE, label: 'Advance' },
          ]}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        keyExtractor={(item) => item.id}
        page={page}
        pageSize={pageSize}
        total={filteredData.length}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
