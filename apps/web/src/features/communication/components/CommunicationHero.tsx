'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { MessageSquare, Plus, FilePlus } from 'lucide-react';

interface CommunicationHeroProps {
  onNewMessage: () => void;
  onNewTemplate: () => void;
  canManageTemplates?: boolean;
}

export function CommunicationHero({
  onNewMessage,
  onNewTemplate,
  canManageTemplates = true,
}: CommunicationHeroProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6D8F1]/40">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-btn">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h1 className="font-quicksand font-bold text-2xl md:text-[28px] text-purple-600">
            Every message, with care.
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          WhatsApp reminders, fee alerts, email notifications, and parent call logs.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {canManageTemplates && (
          <Button
            variant="outline"
            onClick={onNewTemplate}
            className="flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4 text-purple-600" />
            <span>New template</span>
          </Button>
        )}

        <Button
          variant="primary"
          onClick={onNewMessage}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New message</span>
        </Button>
      </div>
    </div>
  );
}

