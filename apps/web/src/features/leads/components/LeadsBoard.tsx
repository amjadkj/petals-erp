'use client';

import React, { useState } from 'react';
import { LeadStage } from '@petals/types';
import { LeadCard } from './LeadCard';
import type { LeadItem, LeadColumnConfig } from '../types';

interface LeadsBoardProps {
  leads: LeadItem[];
  onCardClick: (lead: LeadItem) => void;
  onMoveStage: (lead: LeadItem, targetStage: LeadStage) => void;
  onTriggerConvert: (lead: LeadItem) => void;
}

const columnsConfig: LeadColumnConfig[] = [
  { stage: LeadStage.NEW, title: 'New', dotColor: 'purple' },
  { stage: LeadStage.CONTACTED, title: 'Contacted', dotColor: 'teal' },
  { stage: LeadStage.ASSESSMENT_SCHEDULED, title: 'Assessment scheduled', dotColor: 'purple' },
  { stage: LeadStage.CONVERTED, title: 'Converted', dotColor: 'teal' },
  { stage: LeadStage.LOST, title: 'Lost', dotColor: 'gray', emptyMessage: 'Closed with care. Family chose another centre.' },
];

export function LeadsBoard({
  leads,
  onCardClick,
  onMoveStage,
  onTriggerConvert,
}: LeadsBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<LeadStage | null>(null);

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== stage) {
      setDragOverCol(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    setDragOverCol(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { leadId, currentStage } = JSON.parse(dataStr);
      if (currentStage === targetStage) return;

      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;

      // CRITICAL RULE: "Drag to Converted triggers Convert to client modal (API rejects plain stage change)."
      if (targetStage === LeadStage.CONVERTED) {
        onTriggerConvert(lead);
      } else {
        onMoveStage(lead, targetStage);
      }
    } catch {
      // ignore
    }
  };

  const handleCardMove = (lead: LeadItem, targetStage: LeadStage) => {
    if (targetStage === LeadStage.CONVERTED) {
      onTriggerConvert(lead);
    } else {
      onMoveStage(lead, targetStage);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 snap-x">
      {columnsConfig.map((col) => {
        const columnLeads = leads.filter((l) => l.stage === col.stage);
        const isHovered = dragOverCol === col.stage;

        return (
          <div
            key={col.stage}
            onDragOver={(e) => handleDragOver(e, col.stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.stage)}
            className={`flex flex-col bg-[#F5EFFA]/40 border ${
              isHovered ? 'border-purple-600 ring-2 ring-purple-200' : 'border-[#E6D8F1]/60'
            } rounded-card p-3 min-w-[260px] snap-center transition-all h-[calc(100vh-280px)] min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6D8F1]/50">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    col.dotColor === 'teal'
                      ? 'bg-teal-500'
                      : col.dotColor === 'purple'
                        ? 'bg-purple-600'
                        : 'bg-gray-400'
                  }`}
                />
                <span className="font-quicksand font-bold text-sm text-ink capitalize">
                  {col.title}
                </span>
              </div>
              <span className="bg-white px-2 py-0.5 rounded-chip text-xs font-semibold text-purple-600 border border-[#E6D8F1]">
                {columnLeads.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {columnLeads.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-center p-4">
                  <p className="text-xs text-gray-400 italic">
                    {col.emptyMessage || 'No leads in this stage'}
                  </p>
                </div>
              ) : (
                columnLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={onCardClick}
                    onMoveStage={handleCardMove}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
