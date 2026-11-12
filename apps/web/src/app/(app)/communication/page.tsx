'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { Tabs, TabList, TabTrigger } from '@/components/ui';
import { RoleKey, MessageStatus } from '@petals/types';
import {
  CommunicationHero,
  CommunicationStatCards,
  MessagesLogTab,
  TemplatesTab,
  BulkSendTab,
  NewMessageModal,
  NewTemplateModal,
} from '@/features/communication';
import type {
  CommunicationTab,
  CommunicationLogDto,
  CommunicationTemplateDto,
} from '@/features/communication';
import { communicationApi } from '@/lib/api/communication';
import { clientsApi } from '@/lib/api/clients';
import { branchesApi } from '@/lib/api/branches';
import type { ClientDto, BranchDto } from '@petals/types';

export default function CommunicationPage() {
  usePageTitle('Communication');
  const { myRole } = usePermissions();

  const [activeTab, setActiveTab] = useState<CommunicationTab>('messages');
  const [messages, setMessages] = useState<CommunicationLogDto[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplateDto[]>([]);
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const canManageTemplates =
    myRole === RoleKey.DIRECTOR || myRole === RoleKey.MANAGER;

  // Load communication data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [messagesRes, templatesRes] = await Promise.all([
        communicationApi.getMessages().catch(() => ({ data: [] })),
        communicationApi.getTemplates().catch(() => ({ data: [] })),
      ]);

      setMessages((messagesRes.data as CommunicationLogDto[]) ?? []);
      setTemplates((templatesRes.data as CommunicationTemplateDto[]) ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Fetch clients & branches for modal pickers
    clientsApi
      .getClients({ pageSize: '100' })
      .then((res) => {
        if (res && res.data) setClients(res.data);
      })
      .catch(() => {});

    branchesApi
      .getBranches()
      .then((res) => {
        if (res && res.data) setBranches(res.data);
      })
      .catch(() => {});
  }, [loadData]);

  // Approve template
  const handleApproveTemplate = async (id: string) => {
    try {
      await communicationApi.approveTemplate(id);
      setToastMessage({
        type: 'success',
        text: 'Template approved! Now available for WhatsApp message sending.',
      });
      loadData();
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Failed to approve template.',
      });
    }
  };

  // Reject template
  const handleRejectTemplate = async (id: string) => {
    try {
      await communicationApi.rejectTemplate(id);
      setToastMessage({
        type: 'success',
        text: 'Template rejected.',
      });
      loadData();
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Failed to reject template.',
      });
    }
  };

  // Compute stat card metrics
  const { sentToday, deliveredToday, failedCount, dailyCapUsed } = useMemo(() => {
    let sent = 0;
    let delivered = 0;
    let failed = 0;

    for (const m of messages) {
      sent++;
      if (m.status === MessageStatus.DELIVERED || m.status === MessageStatus.READ) {
        delivered++;
      }
      if (m.status === MessageStatus.FAILED) {
        failed++;
      }
    }

    return {
      sentToday: sent,
      deliveredToday: delivered,
      failedCount: failed,
      dailyCapUsed: sent,
    };
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <CommunicationHero
        onNewMessage={() => setIsNewMessageOpen(true)}
        onNewTemplate={() => setIsNewTemplateOpen(true)}
        canManageTemplates={canManageTemplates}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-card text-sm font-medium flex items-center justify-between ${
            toastMessage.type === 'success'
              ? 'bg-success-bg text-success border border-[#1E6B3A]/20'
              : 'bg-danger-bg text-danger border border-[#B4414F]/20'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <CommunicationStatCards
        sentToday={sentToday}
        deliveredToday={deliveredToday}
        failedCount={failedCount}
        dailyCapUsed={dailyCapUsed}
        dailyCapLimit={500}
        loading={isLoading}
      />

      {/* Tab Navigation */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card px-4 pt-2">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as CommunicationTab)}
        >
          <TabList>
            <TabTrigger value="messages">
              Messages & Log ({messages.length})
            </TabTrigger>
            <TabTrigger value="templates">
              Templates ({templates.length})
            </TabTrigger>
            {canManageTemplates && (
              <TabTrigger value="bulk">Bulk Send</TabTrigger>
            )}
          </TabList>
        </Tabs>
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' && (
        <MessagesLogTab messages={messages} isLoading={isLoading} />
      )}

      {activeTab === 'templates' && (
        <TemplatesTab
          templates={templates}
          roleKey={myRole}
          onApprove={handleApproveTemplate}
          onReject={handleRejectTemplate}
          onNewTemplate={() => setIsNewTemplateOpen(true)}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'bulk' && canManageTemplates && (
        <BulkSendTab
          templates={templates}
          branches={branches}
          onSuccess={loadData}
        />
      )}

      {/* Modals */}
      <NewMessageModal
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
        clients={clients}
        templates={templates}
        onSuccess={loadData}
      />

      <NewTemplateModal
        isOpen={isNewTemplateOpen}
        onClose={() => setIsNewTemplateOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
