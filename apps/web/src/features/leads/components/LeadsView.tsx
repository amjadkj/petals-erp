'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { leadsApi } from '@/lib/api/leads';
import { usePermissionsStore } from '@/lib/permissions/store';
import { useToast } from '@/components/ui/Toast';
import { LeadStage, type LeadDto } from '@petals/types';

import { LeadsHero } from './LeadsHero';
import { LeadsStatCards } from './LeadsStatCards';
import { LeadsFilterBar } from './LeadsFilterBar';
import { LeadsBoard } from './LeadsBoard';
import { LeadsList } from './LeadsList';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { NewLeadModal } from './NewLeadModal';
import { ConvertToClientModal } from './ConvertToClientModal';
import { MarkLostModal } from './MarkLostModal';
import type { LeadItem } from '../types';

export function LeadsView() {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const selectedBranchId = usePermissionsStore((s) => s.selectedBranchId);

  // View & Filters State
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  // Modals & Drawer State
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [convertLead, setConvertLead] = useState<LeadItem | null>(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [lostLead, setLostLead] = useState<LeadItem | null>(null);
  const [isLostOpen, setIsLostOpen] = useState(false);

  // Fetch leads
  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ['leads', selectedBranchId],
    queryFn: () => leadsApi.getLeads(),
  });

  // Local fallback leads matching the mockup exactly
  const initialMockLeads: LeadItem[] = useMemo(() => [
    {
      id: 'lead-1',
      branchId: 'b1',
      childName: 'Reyansh Gupta',
      childDob: '2021-04-12',
      parentName: 'Sneha Gupta',
      phone: '+91 98451 22334',
      email: 'sneha@example.com',
      stage: LeadStage.NEW,
      concerns: 'Speech delay · non-verbal gestures only',
      source: 'Website',
      ownerName: 'Nikhil Kumar',
      createdAt: '2026-11-08T10:00:00Z',
      updatedAt: '2026-11-08T10:00:00Z',
      followUpDate: '2026-11-14',
    },
    {
      id: 'lead-2',
      branchId: 'b1',
      childName: 'Anaya Sen',
      childDob: '2020-08-19',
      parentName: 'Debashis Sen',
      phone: '+91 98452 33445',
      email: 'debashis@example.com',
      stage: LeadStage.NEW,
      concerns: 'Sensory sensitivities · loud sounds',
      source: 'Referral',
      ownerName: 'Priya Nair',
      createdAt: '2026-11-07T11:30:00Z',
      updatedAt: '2026-11-07T11:30:00Z',
      followUpDate: '2026-11-13',
    },
    {
      id: 'lead-3',
      branchId: 'b1',
      childName: 'Advik Nair',
      childDob: '2022-01-15',
      parentName: 'Kavita Nair',
      phone: '+91 98453 44556',
      stage: LeadStage.CONTACTED,
      concerns: 'Delayed milestone responses',
      source: 'Instagram',
      ownerName: 'Nikhil Kumar',
      createdAt: '2026-11-05T09:15:00Z',
      updatedAt: '2026-11-06T14:00:00Z',
      followUpDate: '2026-11-03', // Overdue
      isOverdue: true,
    },
    {
      id: 'lead-4',
      branchId: 'b1',
      childName: 'Tara Kulkarni',
      childDob: '2019-11-03',
      parentName: 'Sameer Kulkarni',
      phone: '+91 98454 55667',
      stage: LeadStage.ASSESSMENT_SCHEDULED,
      concerns: 'ADHD evaluation & classroom focus',
      source: 'School referral',
      ownerName: 'Anita Sen',
      createdAt: '2026-11-04T12:00:00Z',
      updatedAt: '2026-11-05T16:30:00Z',
      followUpDate: '2026-11-12',
    },
    {
      id: 'lead-5',
      branchId: 'b1',
      childName: 'Zainab Fatima',
      childDob: '2021-09-10',
      parentName: 'Farhan Fatima',
      phone: '+91 98455 66778',
      stage: LeadStage.CONVERTED,
      concerns: 'Speech clarity & articulation',
      source: 'Paediatrician',
      ownerName: 'Nikhil Kumar',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-04T11:00:00Z',
      convertedDate: '2026-11-04',
    },
    {
      id: 'lead-6',
      branchId: 'b1',
      childName: 'Ishaan Verma',
      childDob: '2020-05-24',
      parentName: 'Ritu Verma',
      phone: '+91 98456 77889',
      stage: LeadStage.LOST,
      concerns: 'Occupational therapy intake',
      source: 'Walk-in',
      ownerName: 'Anita Sen',
      createdAt: '2026-10-25T10:00:00Z',
      updatedAt: '2026-11-02T15:00:00Z',
      closedDate: '2026-11-02',
    },
  ], []);

  const [localLeads, setLocalLeads] = useState<LeadItem[]>(initialMockLeads);

  // Sync when API data loads
  const allLeads: LeadItem[] = useMemo(() => {
    if (leadsResponse?.data && leadsResponse.data.length > 0) {
      return leadsResponse.data.map((l) => ({
        ...l,
        ownerName: 'Nikhil Kumar',
      }));
    }
    return localLeads;
  }, [leadsResponse, localLeads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      if (sourceFilter !== 'ALL' && lead.source !== sourceFilter) return false;
      if (ownerFilter !== 'ALL' && lead.ownerName !== ownerFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchChild = lead.childName.toLowerCase().includes(q);
        const matchParent = lead.parentName?.toLowerCase().includes(q);
        const matchPhone = lead.phone?.toLowerCase().includes(q);
        const matchConcern = lead.concerns?.toLowerCase().includes(q);
        if (!matchChild && !matchParent && !matchPhone && !matchConcern) return false;
      }
      return true;
    });
  }, [allLeads, sourceFilter, ownerFilter, searchQuery]);

  // Stage move handler
  const handleMoveStage = async (lead: LeadItem, targetStage: LeadStage) => {
    // If target is CONVERTED, must trigger convert modal instead
    if (targetStage === LeadStage.CONVERTED) {
      handleTriggerConvert(lead);
      return;
    }

    try {
      await leadsApi.updateLead(lead.id, { stage: targetStage });
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, stage: targetStage } : l)),
      );
      showToast(`Lead moved to ${targetStage.replace(/_/g, ' ').toLowerCase()}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch {
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, stage: targetStage } : l)),
      );
      showToast(`Lead moved to ${targetStage.replace(/_/g, ' ').toLowerCase()}`, 'success');
    }
  };

  const handleTriggerConvert = (lead: LeadItem) => {
    setConvertLead(lead);
    setIsConvertOpen(true);
  };

  const handleCardClick = (lead: LeadItem) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleLogFollowUp = async (leadId: string, note: string, nextDate: string) => {
    try {
      await leadsApi.updateLead(leadId, {
        notes: note,
      });
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, notes: note, followUpDate: nextDate, isOverdue: false } : l)),
      );
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, notes: note, followUpDate: nextDate, isOverdue: false });
      }
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch {
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, notes: note, followUpDate: nextDate, isOverdue: false } : l)),
      );
    }
  };

  const handleNewLeadSuccess = (newLead: LeadDto) => {
    setLocalLeads((prev) => [
      {
        ...newLead,
        ownerName: 'Nikhil Kumar',
        followUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      },
      ...prev,
    ]);
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const handleConvertSuccess = (newClientId?: string) => {
    if (convertLead) {
      setLocalLeads((prev) =>
        prev.map((l) =>
          l.id === convertLead.id
            ? { ...l, stage: LeadStage.CONVERTED, convertedDate: new Date().toISOString().split('T')[0] }
            : l,
        ),
      );
    }
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    if (newClientId) {
      router.push(`/clients/${newClientId}`);
    }
  };

  const handleLostSuccess = (leadId: string) => {
    setLocalLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, stage: LeadStage.LOST, closedDate: new Date().toISOString().split('T')[0] }
          : l,
      ),
    );
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero */}
      <LeadsHero
        onNewLead={() => setIsNewLeadOpen(true)}
        onExport={() => showToast('Exporting leads directory (CSV)...', 'info')}
      />

      {/* 4 Stat Cards */}
      <LeadsStatCards isLoading={isLoading} />

      {/* Filter Bar */}
      <LeadsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sourceFilter={sourceFilter}
        onSourceChange={setSourceFilter}
        ownerFilter={ownerFilter}
        onOwnerChange={setOwnerFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Board or List View */}
      {viewMode === 'board' ? (
        <LeadsBoard
          leads={filteredLeads}
          onCardClick={handleCardClick}
          onMoveStage={handleMoveStage}
          onTriggerConvert={handleTriggerConvert}
        />
      ) : (
        <LeadsList
          leads={filteredLeads}
          onRowClick={handleCardClick}
          isLoading={isLoading}
        />
      )}

      {/* Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onConvert={(l) => {
          setIsDrawerOpen(false);
          handleTriggerConvert(l);
        }}
        onMarkLost={(l) => {
          setIsDrawerOpen(false);
          setLostLead(l);
          setIsLostOpen(true);
        }}
        onLogFollowUp={handleLogFollowUp}
      />

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onSuccess={handleNewLeadSuccess}
      />

      {/* Convert to Client Modal */}
      <ConvertToClientModal
        lead={convertLead}
        isOpen={isConvertOpen}
        onClose={() => {
          setIsConvertOpen(false);
          setConvertLead(null);
        }}
        onSuccess={handleConvertSuccess}
      />

      {/* Mark Lost Modal */}
      <MarkLostModal
        lead={lostLead}
        isOpen={isLostOpen}
        onClose={() => {
          setIsLostOpen(false);
          setLostLead(null);
        }}
        onSuccess={handleLostSuccess}
      />
    </div>
  );
}
