import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommunicationHero } from '../components/CommunicationHero';
import { CommunicationStatCards } from '../components/CommunicationStatCards';
import { MessagesLogTab } from '../components/MessagesLogTab';
import { TemplatesTab } from '../components/TemplatesTab';
import { CommunicationChannel, MessageStatus, TemplateStatus, RoleKey } from '@petals/types';
import type { CommunicationLogDto, CommunicationTemplateDto } from '../types';

describe('Communication Feature Components', () => {
  it('renders CommunicationHero correctly', () => {
    const onNewMessage = vi.fn();
    const onNewTemplate = vi.fn();

    render(
      <CommunicationHero
        onNewMessage={onNewMessage}
        onNewTemplate={onNewTemplate}
        canManageTemplates={true}
      />,
    );

    expect(screen.getByText('Every message, with care.')).toBeInTheDocument();
    expect(screen.getByText('New template')).toBeInTheDocument();
    expect(screen.getByText('New message')).toBeInTheDocument();
  });

  it('renders CommunicationStatCards with percentage calculation', () => {
    render(
      <CommunicationStatCards
        sentToday={100}
        deliveredToday={95}
        failedCount={2}
        dailyCapUsed={120}
        dailyCapLimit={500}
      />,
    );

    expect(screen.getByText('Sent Today')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('95% delivery rate')).toBeInTheDocument();
    expect(screen.getByText('120 / 500')).toBeInTheDocument();
  });

  it('renders MessagesLogTab with client and channel icons', () => {
    const mockLogs: CommunicationLogDto[] = [
      {
        id: 'msg-1',
        clientId: 'c-1',
        sentById: 'u-1',
        channel: CommunicationChannel.WHATSAPP,
        recipient: '+919876543210',
        message: 'Reminder for Aarav session on Tuesday.',
        status: MessageStatus.DELIVERED,
        sentAt: '2026-02-12T10:00:00Z',
        client: {
          id: 'c-1',
          name: 'Aarav Patel',
          clientCode: 'PET-001',
          primaryGuardian: {
            name: 'Priya Patel',
            phone: '+919876543210',
            relation: 'Mother',
          },
        },
        sentBy: { id: 'u-1', name: 'Dr. Sarah' },
      },
    ];

    render(<MessagesLogTab messages={mockLogs} />);

    expect(screen.getAllByText('Aarav Patel')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Priya Patel (Mother)')[0]).toBeInTheDocument();
  });

  it('renders TemplatesTab with approve/reject buttons for Director', () => {
    const mockTemplates: CommunicationTemplateDto[] = [
      {
        id: 'tpl-1',
        name: 'session_reminder',
        language: 'en',
        body: 'Reminder for {{1}} on {{2}}.',
        status: TemplateStatus.PENDING_APPROVAL,
        createdAt: '2026-02-10T10:00:00Z',
        updatedAt: '2026-02-10T10:00:00Z',
      },
    ];

    const onApprove = vi.fn();
    const onReject = vi.fn();
    const onNewTemplate = vi.fn();

    render(
      <TemplatesTab
        templates={mockTemplates}
        roleKey={RoleKey.DIRECTOR}
        onApprove={onApprove}
        onReject={onReject}
        onNewTemplate={onNewTemplate}
      />,
    );

    expect(screen.getByText('session_reminder')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Approve'));
    expect(onApprove).toHaveBeenCalledWith('tpl-1');
  });
});

