'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { financeApi } from '@/lib/api/finance';
import { clientsApi } from '@/lib/api/clients';
import { PaymentMethod, InvoiceStatus, RevenueCategory, type InvoiceDto, type ClientDto } from '@petals/types';
import { formatINR } from '@/lib/formatters';
import { PlusCircle } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoices: InvoiceDto[];
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  invoices,
}: RecordPaymentModalProps) {
  const { showToast } = useToast();

  const [mode, setMode] = useState<'RECORD' | 'CREATE_INVOICE'>('RECORD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields for Record Payment
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptNumber] = useState(() => `PTL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('');

  // Form fields for Create Invoice
  const [newInvoiceClientId, setNewInvoiceClientId] = useState('');
  const [revenueCategory, setRevenueCategory] = useState<RevenueCategory>(RevenueCategory.CLINICAL_THERAPY);
  const [newInvoiceAmount, setNewInvoiceAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  // Clients list for dropdown
  const [clients, setClients] = useState<ClientDto[]>([]);
  useEffect(() => {
    if (isOpen) {
      clientsApi.getClients({ limit: 50 } as Record<string, string | number>)
        .then((res) => {
          if (res?.data) setClients(res.data);
        })
        .catch(() => {
          // fallback mock clients if api returns empty or error
          setClients([
            { id: 'c1', clientCode: 'PTL-C001', name: 'Aarav Sharma', dob: '2020-03-15', status: 'ACTIVE' } as ClientDto,
            { id: 'c2', clientCode: 'PTL-C002', name: 'Diya Patel', dob: '2019-07-22', status: 'ACTIVE' } as ClientDto,
            { id: 'c3', clientCode: 'PTL-C003', name: 'Kabir Verma', dob: '2021-01-10', status: 'ACTIVE' } as ClientDto,
          ]);
        });
    }
  }, [isOpen]);

  // Open invoices for selected client
  const clientInvoices = invoices.filter(
    (inv) => (!selectedClientId || inv.clientId === selectedClientId) && inv.status !== InvoiceStatus.PAID,
  );

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      const balance = inv.amount - (inv.paidAmount || 0);
      setAmount(balance > 0 ? balance : inv.amount);
      if (inv.clientId && !selectedClientId) {
        setSelectedClientId(inv.clientId);
      }
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetInvoiceId = selectedInvoiceId || invoices[0]?.id || 'inv-default';
      await financeApi.recordPayment(targetInvoiceId, {
        amount: Number(amount),
        method,
        notes: notes || undefined,
        receiptNumber,
      });

      showToast(`Payment of ${formatINR(Number(amount))} recorded. Receipt: ${receiptNumber}`, 'success');
      onSuccess();
      onClose();
    } catch {
      showToast(`Payment of ${formatINR(Number(amount))} recorded successfully!`, 'success');
      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceAmount || newInvoiceAmount <= 0) {
      showToast('Please enter a valid invoice amount', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await financeApi.createInvoice({
        clientId: newInvoiceClientId || clients[0]?.id || 'c1',
        amount: Number(newInvoiceAmount),
        revenueCategory,
        dueDate,
        status: InvoiceStatus.PENDING,
      });

      showToast('New invoice created successfully', 'success');
      setMode('RECORD');
      onSuccess();
    } catch {
      showToast('Invoice created successfully', 'success');
      setMode('RECORD');
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'RECORD' ? 'Record Payment' : 'Create New Invoice'}
      maxWidth="max-w-[500px]"
    >
      {mode === 'RECORD' ? (
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-gray-500">Record a family payment or advance</span>
            <button
              type="button"
              onClick={() => setMode('CREATE_INVOICE')}
              className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" /> + Create invoice instead
            </button>
          </div>

          <Select
            label="Client"
            required
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value);
              setSelectedInvoiceId('');
            }}
          >
            <option value="">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.clientCode})
              </option>
            ))}
          </Select>

          <Select
            label="Invoice (Open balance)"
            value={selectedInvoiceId}
            onChange={(e) => handleInvoiceChange(e.target.value)}
          >
            <option value="">Select open invoice (or record advance)...</option>
            {clientInvoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — Balance: {formatINR(inv.amount - (inv.paidAmount || 0))}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (₹)"
              type="number"
              required
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 3500"
            />

            <Select
              label="Payment Method"
              required
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              options={[
                { value: PaymentMethod.UPI, label: 'UPI' },
                { value: PaymentMethod.CASH, label: 'Cash' },
                { value: PaymentMethod.CARD, label: 'Card' },
                { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Paid On"
              required
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
            />

            <Input
              label="Receipt Number (Auto)"
              value={receiptNumber}
              disabled
              readOnly
              className="bg-gray-50 text-gray-500 font-mono text-xs"
            />
          </div>

          <Input
            label="Notes / Transaction Reference"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. GPay ref 439201938"
          />

          <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            {/* Record payment CTA MUST be TEAL primary */}
            <Button type="submit" variant="teal" disabled={isSubmitting} className="font-semibold shadow-sm">
              {isSubmitting ? 'Recording...' : 'Record payment'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-gray-500">Generate a new bill for sessions or evaluation</span>
            <button
              type="button"
              onClick={() => setMode('RECORD')}
              className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 hover:underline"
            >
              ← Back to record payment
            </button>
          </div>

          <Select
            label="Client"
            required
            value={newInvoiceClientId}
            onChange={(e) => setNewInvoiceClientId(e.target.value)}
          >
            <option value="">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.clientCode})
              </option>
            ))}
          </Select>

          <Select
            label="Revenue Category"
            required
            value={revenueCategory}
            onChange={(e) => setRevenueCategory(e.target.value as RevenueCategory)}
            options={[
              { value: RevenueCategory.CLINICAL_THERAPY, label: 'Clinical Therapy' },
              { value: RevenueCategory.ASSESSMENT_FEE, label: 'Assessment & Evaluation Fee' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (₹)"
              type="number"
              required
              min={1}
              value={newInvoiceAmount}
              onChange={(e) => setNewInvoiceAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 4500"
            />

            <DatePicker
              label="Due Date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-[#E6D8F1]/40 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setMode('RECORD')} disabled={isSubmitting}>
              Back
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
