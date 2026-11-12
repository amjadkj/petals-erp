'use client';

import React, { useState } from 'react';
import { Button, Modal, Input, Select, useToast } from '@/components/ui';
import { ClientOverviewData, clientsApi } from '@/lib/api/clients';
import { RoleKey } from '@petals/types';
import { User, Phone, Mail, MessageCircle, ShieldCheck, Plus } from 'lucide-react';

interface OverviewTabProps {
  clientId: string;
  data?: ClientOverviewData;
  role: RoleKey;
  onRefresh: () => void;
}

export function OverviewTab({
  clientId,
  data,
  role,
  onRefresh,
}: OverviewTabProps) {
  const { showToast } = useToast();
  const [isAddGuardianOpen, setIsAddGuardianOpen] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const guardians = data?.guardians || [
    {
      id: 'g1',
      name: data?.primaryGuardian?.name || 'Deepa Nair',
      relation: data?.primaryGuardian?.relation || 'Mother',
      phone: data?.primaryGuardian?.phone || '+91 98450 12345',
      email: data?.primaryGuardian?.email || 'deepa.nair@example.com',
      isPrimary: true,
      whatsappConsent: true,
      emailConsent: true,
    },
  ];

  const therapists = data?.assignedTherapists || [
    { id: '1', name: 'Dr. Ananya Sharma', designation: 'Senior Speech Therapist', department: 'Speech' },
    { id: '2', name: 'Rajesh Menon', designation: 'Occupational Therapist', department: 'OT' },
  ];

  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName.trim() || !phone.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await clientsApi.addGuardian(clientId, {
        name: guardianName.trim(),
        relation,
        phone: phone.trim(),
        email: email.trim() || undefined,
        whatsappConsent: true,
        emailConsent: true,
      });

      showToast('Guardian added successfully!', 'success');
      onRefresh();
      setIsAddGuardianOpen(false);
      setGuardianName('');
      setPhone('');
      setEmail('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to add guardian', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isManager = role === RoleKey.MANAGER;

  return (
    <div className="space-y-6">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Guardians */}
        <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6D8F1]/40">
            <div>
              <h3 className="font-quicksand font-bold text-base text-ink">
                Parents & Guardians
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Primary contacts and portal login accounts
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddGuardianOpen(true)}
              className="h-8 px-2.5 text-xs flex items-center gap-1 border-purple-200 text-purple-800 hover:bg-purple-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Button>
          </div>

          <div className="space-y-3">
            {guardians.map((g) => (
              <div
                key={g.id}
                className="p-4 bg-purple-50/40 rounded-card border border-[#E6D8F1]/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-sm text-ink">{g.name}</span>
                    <span className="text-xs text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-medium">
                      {g.relation}
                    </span>
                  </div>
                  {g.isPrimary && (
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-chip">
                      Primary Contact
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{g.phone}</span>
                  </div>
                  {g.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{g.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1 border-t border-[#E6D8F1]/30">
                  <span className="flex items-center gap-1 text-success">
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp Opted In</span>
                  </span>
                  <span className="flex items-center gap-1 text-teal-700">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Care Updates Consent</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Assigned Therapists & Care Details */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-4">
            <div className="pb-3 border-b border-[#E6D8F1]/40">
              <h3 className="font-quicksand font-bold text-base text-ink">
                Assigned Clinical Team
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Therapists managing active care plans
              </p>
            </div>

            <div className="space-y-3">
              {therapists.map((therapist) => (
                <div
                  key={therapist.id}
                  className="p-3 bg-white border border-[#E6D8F1]/40 rounded-btn flex items-center justify-between gap-3 hover:bg-purple-50/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {therapist.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-ink">{therapist.name}</div>
                      <div className="text-xs text-gray-500">{therapist.designation || 'Therapist'}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {therapist.department || 'Clinical'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Case History (hidden from Manager per PRD 4.1.4) */}
          {!isManager && (
            <div className="bg-white border border-[#E6D8F1]/60 rounded-card p-5 space-y-3">
              <div className="pb-2 border-b border-[#E6D8F1]/40">
                <h3 className="font-quicksand font-bold text-base text-ink">
                  Case History & Clinical Notes
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {data?.caseHistory ||
                  'Initial evaluation completed in October 2026. Referred for speech sound delays and sensory processing sensitivity. Shows receptive language strengths, currently focusing on expressive clarity and fine motor bilateral coordination.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Guardian Modal */}
      <Modal
        isOpen={isAddGuardianOpen}
        onClose={() => setIsAddGuardianOpen(false)}
        title="Add Guardian"
        maxWidth="max-w-[480px]"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddGuardianOpen(false)}
              className="h-9 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAddGuardian}
              disabled={isSubmitting || !guardianName.trim() || !phone.trim()}
              className="h-9 px-4 text-xs font-semibold"
            >
              {isSubmitting ? 'Saving...' : 'Add Guardian'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddGuardian} className="space-y-3.5">
          <Input
            label="Guardian Full Name"
            required
            placeholder="e.g. Ramesh Nair"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
          />

          <Select
            label="Relation"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            options={[
              { value: 'Father', label: 'Father' },
              { value: 'Mother', label: 'Mother' },
              { value: 'Guardian', label: 'Legal Guardian' },
              { value: 'Grandparent', label: 'Grandparent' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <Input
            label="Phone Number"
            required
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="parent@example.com"
            helperText="Used for parent portal invite and notifications"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
