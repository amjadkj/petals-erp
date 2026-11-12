'use client';

import React from 'react';
import { LeadStage } from '@petals/types';
import { formatDateSafe, computeAge } from '@/lib/formatters';
import { MoreVertical, UserCheck } from 'lucide-react';
import type { LeadItem } from '../types';

interface LeadCardProps {
  lead: LeadItem;
  onClick: (lead: LeadItem) => void;
  onMoveStage: (lead: LeadItem, targetStage: LeadStage) => void;
}

export function LeadCard({ lead, onClick, onMoveStage }: LeadCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isOverdue = lead.isOverdue || (lead.stage !== LeadStage.CONVERTED && lead.stage !== LeadStage.LOST && lead.followUpDate && new Date(lead.followUpDate) < new Date());
  const isConverted = lead.stage === LeadStage.CONVERTED;
  const isLost = lead.stage === LeadStage.LOST;

  // Drag start handler
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ leadId: lead.id, currentStage: lead.stage }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Card border styling
  let borderClass = 'border-[#E6D8F1]/80 hover:border-purple-300';
  if (isOverdue) borderClass = 'border-danger/70 shadow-sm';
  if (isConverted) borderClass = 'border-teal-200';
  if (isLost) borderClass = 'border-gray-200 opacity-80';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(lead)}
      className={`group relative bg-white border ${borderClass} rounded-card shadow-sm hover:shadow transition-all cursor-pointer select-none overflow-hidden flex flex-col justify-between`}
    >
      <div className="p-3.5 space-y-2">
        {/* Header: Child name and stage menu */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-quicksand font-bold text-base text-ink group-hover:text-purple-600 transition-colors">
              {lead.childName}
            </h4>
            <div className="text-xs text-gray-500 font-medium">
              {computeAge(lead.childDob)}
            </div>
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded text-gray-400 hover:text-ink hover:bg-purple-50 transition-colors"
              aria-label="Lead actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-7 w-44 bg-white border border-[#E6D8F1] rounded-btn shadow-lg py-1.5 z-20 text-xs font-medium"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Move to stage
                </div>
                {Object.values(LeadStage).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onMoveStage(lead, st);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-purple-50 transition-colors capitalize ${
                      lead.stage === st ? 'text-purple-600 font-semibold bg-purple-50/50' : 'text-ink'
                    }`}
                  >
                    {st.replace(/_/g, ' ').toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Concern */}
        {lead.concerns && (
          <div className="text-xs text-gray-700 bg-purple-50/60 rounded px-2 py-1 font-medium line-clamp-2">
            {lead.concerns}
          </div>
        )}

        {/* Source & Owner Chip */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
          <span>Source: {lead.source || 'Website'}</span>

          {lead.ownerName && (
            <span className="inline-flex items-center gap-1 bg-[#F5EFFA] text-purple-800 px-2 py-0.5 rounded-chip font-medium">
              <span className="w-3.5 h-3.5 rounded-full bg-purple-200 text-[9px] flex items-center justify-center font-bold">
                {lead.ownerName.charAt(0)}
              </span>
              {lead.ownerName}
            </span>
          )}
        </div>
      </div>

      {/* Footer Band */}
      {isOverdue ? (
        <div className="bg-danger-bg text-danger px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between border-t border-danger/30">
          <span>Overdue · {formatDateSafe(lead.followUpDate || lead.updatedAt)}</span>
        </div>
      ) : isConverted ? (
        <div className="bg-teal-50 text-teal-700 px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between border-t border-teal-200">
          <span className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Converted · {formatDateSafe(lead.convertedDate || lead.updatedAt)}
          </span>
        </div>
      ) : isLost ? (
        <div className="bg-[#F5EFFA] text-gray-600 px-3.5 py-1.5 text-xs font-medium flex items-center justify-between border-t border-[#E6D8F1]">
          <span>Closed · {formatDateSafe(lead.closedDate || lead.updatedAt)}</span>
        </div>
      ) : (
        <div className="bg-gray-50 text-gray-600 px-3.5 py-1.5 text-xs font-medium flex items-center justify-between border-t border-gray-100">
          <span>Follow-up · {formatDateSafe(lead.followUpDate || lead.createdAt)}</span>
        </div>
      )}
    </div>
  );
}
