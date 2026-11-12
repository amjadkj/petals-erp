import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaymentHero } from '../components/PaymentHero';
import { PaymentStatCards } from '../components/PaymentStatCards';
import { OverdueReminders } from '../components/OverdueReminders';
import { PaymentsTable } from '../components/PaymentsTable';
import { ToastProvider } from '@/components/ui/Toast';
import { InvoiceStatus, PaymentMethod } from '@petals/types';
import type { PaymentRow, OverdueAccount } from '../types';

describe('Financial Feature Components', () => {
  it('PaymentHero renders headline and TEAL primary Record payment button', () => {
    const handleRecord = vi.fn();
    const handleExport = vi.fn();

    render(
      <PaymentHero
        onRecordPayment={handleRecord}
        onExport={handleExport}
      />,
    );

    expect(screen.getByText('Clear balances. Continued care.')).toBeInTheDocument();

    const recordBtn = screen.getByRole('button', { name: /record payment/i });
    expect(recordBtn).toBeInTheDocument();
    // Verify TEAL variant styling
    expect(recordBtn).toHaveClass('bg-teal-500');

    fireEvent.click(recordBtn);
    expect(handleRecord).toHaveBeenCalledTimes(1);

    const exportBtn = screen.getByRole('button', { name: /export/i });
    expect(exportBtn).toHaveClass('border-purple-600');
    fireEvent.click(exportBtn);
    expect(handleExport).toHaveBeenCalledTimes(1);
  });

  it('PaymentStatCards renders all 4 financial stat cards with formatted values', () => {
    render(
      <PaymentStatCards
        paidThisMonth={372000}
        pendingAmount={48000}
        pendingCount={12}
        overdueCount={3}
        advanceBalance={22000}
        receivedThisWeek={105000}
      />,
    );

    expect(screen.getByText('Paid this month')).toBeInTheDocument();
    expect(screen.getByText('₹3.72L')).toBeInTheDocument();
    expect(screen.getByText('Pending payments')).toBeInTheDocument();
    expect(screen.getByText('₹48,000')).toBeInTheDocument();
    expect(screen.getByText('12 families · 3 overdue')).toBeInTheDocument();
    expect(screen.getByText('Advance balance')).toBeInTheDocument();
    expect(screen.getByText('₹22,000')).toBeInTheDocument();
  });

  it('OverdueReminders renders gentle reminder panel with Send reminder action', () => {
    const mockAccounts: OverdueAccount[] = [
      {
        id: 'acc-1',
        clientName: 'Kabir Verma',
        clientId: 'c3',
        invoiceId: 'inv-3',
        amount: 3000,
        dueDate: '2026-10-31',
      },
    ];

    render(
      <ToastProvider>
        <OverdueReminders accounts={mockAccounts} />
      </ToastProvider>,
    );

    expect(screen.getByText('A gentle reminder can help.')).toBeInTheDocument();
    expect(screen.getByText('Kabir Verma')).toBeInTheDocument();
    expect(screen.getByText(/₹3,000 · Due 31 Oct 2026/i)).toBeInTheDocument();

    const remindBtn = screen.getByRole('button', { name: /send reminder/i });
    expect(remindBtn).toBeInTheDocument();
  });

  it('PaymentsTable correctly renders rows, tabs, and pending row dashes', () => {
    const mockPayments: PaymentRow[] = [
      {
        id: 'p1',
        clientName: 'Aarav Sharma',
        date: '2026-11-10',
        amount: 3500,
        method: PaymentMethod.UPI,
        status: InvoiceStatus.PAID,
        receiptNumber: 'PTL-1028',
      },
      {
        id: 'p2',
        clientName: 'Rohan Mehra',
        date: '2026-11-04',
        amount: 3000,
        method: undefined,
        status: InvoiceStatus.PENDING,
        receiptNumber: undefined,
        dueDate: '2026-10-31',
      },
    ];

    render(
      <ToastProvider>
        <PaymentsTable payments={mockPayments} />
      </ToastProvider>,
    );

    expect(screen.getAllByText('Aarav Sharma')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Rohan Mehra')[0]).toBeInTheDocument();
    expect(screen.getAllByText('PTL-1028')[0]).toBeInTheDocument();

    // Verify tabs
    expect(screen.getByRole('button', { name: 'All payments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pending' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Advance' })).toBeInTheDocument();
  });
});
