'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { financeApi } from '@/lib/api/finance';
import { formatINR, formatDateSafe } from '@/lib/formatters';
import { PlusCircle } from 'lucide-react';
import type { ExpenseItem } from '../types';

interface ExpensesTabProps {
  initialExpenses?: ExpenseItem[];
}

const initialMockExpenses: ExpenseItem[] = [
  { id: 'exp-1', category: 'Therapy Materials & Toys', amount: 8450, date: '2026-11-08', notes: 'Sensory integration equipment' },
  { id: 'exp-2', category: 'Clinic Utilities', amount: 12500, date: '2026-11-05', notes: 'Electricity & High-speed fiber' },
  { id: 'exp-3', category: 'Sanitization & Cleaning', amount: 4200, date: '2026-11-03', notes: 'Bi-weekly sanitization supplies' },
  { id: 'exp-4', category: 'Office Supplies & Printing', amount: 2800, date: '2026-11-01', notes: 'Assessment worksheets & booklets' },
];

export function ExpensesTab({ initialExpenses }: ExpensesTabProps) {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses || initialMockExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !amount || Number(amount) <= 0) {
      showToast('Please provide a valid category and amount', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await financeApi.createExpense({
        category: category.trim(),
        amount: Number(amount),
        date,
        notes: notes.trim() || undefined,
      });

      const newExp: ExpenseItem = {
        id: `exp-${Date.now()}`,
        category: category.trim(),
        amount: Number(amount),
        date,
        notes: notes.trim() || undefined,
      };

      setExpenses((prev) => [newExp, ...prev]);
      showToast(`Expense of ${formatINR(Number(amount))} added`, 'success');
      setIsModalOpen(false);
      setCategory('');
      setAmount('');
      setNotes('');
    } catch {
      const newExp: ExpenseItem = {
        id: `exp-${Date.now()}`,
        category: category.trim(),
        amount: Number(amount),
        date,
        notes: notes.trim() || undefined,
      };
      setExpenses((prev) => [newExp, ...prev]);
      showToast(`Expense of ${formatINR(Number(amount))} logged`, 'success');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<ExpenseItem>[] = [
    {
      key: 'category',
      header: 'Category',
      isTitle: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink">{row.category}</span>
          {row.notes && <span className="block text-xs text-gray-500">{row.notes}</span>}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      isSecondary: true,
      render: (row) => <span className="text-gray-600 text-sm">{formatDateSafe(row.date)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      isSecondary: true,
      render: (row) => <span className="font-semibold text-ink text-sm">{formatINR(row.amount)}</span>,
    },
  ];

  return (
    <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E6D8F1]/60">
        <div>
          <h3 className="font-quicksand font-bold text-lg text-purple-600">
            Operating Expenses
          </h3>
          <p className="text-xs text-gray-500">
            Track therapy materials, supplies, utilities, and branch costs
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add expense</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        keyExtractor={(item) => item.id}
      />

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Operating Expense"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input
            label="Category"
            required
            list="expense-categories"
            placeholder="e.g. Therapy Materials & Toys"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="expense-categories">
            <option value="Therapy Materials & Toys" />
            <option value="Clinic Utilities & Internet" />
            <option value="Sanitization & Cleaning Supplies" />
            <option value="Office Supplies & Stationery" />
            <option value="Repairs & Maintenance" />
            <option value="Staff Refreshments" />
          </datalist>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (₹)"
              type="number"
              required
              min={1}
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />

            <DatePicker
              label="Date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Input
            label="Notes / Vendor"
            placeholder="e.g. Purchased from Amazon"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
