import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeadsHero } from '../components/LeadsHero';
import { LeadsStatCards } from '../components/LeadsStatCards';
import { LeadsBoard } from '../components/LeadsBoard';
import { LeadCard } from '../components/LeadCard';
import { LeadStage } from '@petals/types';
import type { LeadItem } from '../types';

const mockLeads: LeadItem[] = [
  {
    id: 'l-1',
    branchId: 'b1',
    childName: 'Reyansh Gupta',
    childDob: '2021-04-12',
    parentName: 'Sneha Gupta',
    phone: '+91 98451 22334',
    stage: LeadStage.NEW,
    concerns: 'Speech delay',
    source: 'Website',
    ownerName: 'Nikhil Kumar',
    createdAt: '2026-11-08T10:00:00Z',
    updatedAt: '2026-11-08T10:00:00Z',
  },
  {
    id: 'l-2',
    branchId: 'b1',
    childName: 'Advik Nair',
    childDob: '2022-01-15',
    parentName: 'Kavita Nair',
    phone: '+91 98453 44556',
    stage: LeadStage.CONTACTED,
    concerns: 'Delayed milestone responses',
    source: 'Instagram',
    ownerName: 'Nikhil Kumar',
    isOverdue: true,
    createdAt: '2026-11-05T09:15:00Z',
    updatedAt: '2026-11-06T14:00:00Z',
  },
  {
    id: 'l-3',
    branchId: 'b1',
    childName: 'Zainab Fatima',
    childDob: '2021-09-10',
    parentName: 'Farhan Fatima',
    phone: '+91 98455 66778',
    stage: LeadStage.CONVERTED,
    concerns: 'Speech clarity',
    source: 'Paediatrician',
    ownerName: 'Nikhil Kumar',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-04T11:00:00Z',
  },
];

describe('Leads Feature Components', () => {
  it('LeadsHero renders title, sub, and + New lead button', () => {
    const handleNew = vi.fn();
    const handleExport = vi.fn();

    render(<LeadsHero onNewLead={handleNew} onExport={handleExport} />);

    expect(screen.getByText('Every enquiry is a new beginning.')).toBeInTheDocument();
    const newBtn = screen.getByRole('button', { name: /\+ new lead/i });
    expect(newBtn).toBeInTheDocument();
    fireEvent.click(newBtn);
    expect(handleNew).toHaveBeenCalledTimes(1);
  });

  it('LeadsStatCards renders all 4 lead pipeline cards', () => {
    render(
      <LeadsStatCards
        newThisMonth={18}
        activePipeline={14}
        convertedThisMonth={3}
        followUpsDue={6}
      />,
    );

    expect(screen.getByText('New leads this month')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('Active pipeline')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Converted this month')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Follow-ups due')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('LeadsBoard renders all 5 kanban columns', () => {
    const handleCardClick = vi.fn();
    const handleMove = vi.fn();
    const handleConvert = vi.fn();

    render(
      <LeadsBoard
        leads={mockLeads}
        onCardClick={handleCardClick}
        onMoveStage={handleMove}
        onTriggerConvert={handleConvert}
      />,
    );

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Assessment scheduled')).toBeInTheDocument();
    expect(screen.getByText('Converted')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(screen.getByText('Reyansh Gupta')).toBeInTheDocument();
  });

  it('LeadCard triggers stage change or convert callback', () => {
    const handleClick = vi.fn();
    const handleMove = vi.fn();

    render(
      <LeadCard
        lead={mockLeads[0]}
        onClick={handleClick}
        onMoveStage={handleMove}
      />,
    );

    expect(screen.getByText('Reyansh Gupta')).toBeInTheDocument();
    expect(screen.getByText('Speech delay')).toBeInTheDocument();
    expect(screen.getByText('Source: Website')).toBeInTheDocument();

    // Click card
    fireEvent.click(screen.getByText('Reyansh Gupta'));
    expect(handleClick).toHaveBeenCalledWith(mockLeads[0]);
  });
});
