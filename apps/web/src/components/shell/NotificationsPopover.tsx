'use client';

import React, { useState } from 'react';
import { Popover } from '@/components/ui/Popover';
import { Badge } from '@/components/ui/Badge';
import { Bell, Check, Clock, FileText, CreditCard, Calendar } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'report-due' | 'leave' | 'payment-due' | 'session-reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'report-due',
      title: 'Assessment Report Due',
      message: 'Aarav Sharma - Speech Therapy report due today',
      time: '10m ago',
      read: false,
    },
    {
      id: '2',
      type: 'leave',
      title: 'Leave Request',
      message: 'Dr. Sneha applied for Casual Leave tomorrow',
      time: '1h ago',
      read: false,
    },
    {
      id: '3',
      type: 'payment-due',
      title: 'Payment Due',
      message: 'Invoice #INV-2024-0012 pending for Vihaan',
      time: '3h ago',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markItemRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'report-due':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'leave':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'payment-due':
        return <CreditCard className="w-4 h-4 text-danger" />;
      case 'session-reminder':
        return <Calendar className="w-4 h-4 text-teal-700" />;
    }
  };

  return (
    <Popover
      trigger={
        <button
          type="button"
          aria-label="Open notifications"
          className="relative p-2 rounded-btn text-gray-500 hover:text-ink hover:bg-purple-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
        >
          <Badge count={unreadCount}>
            <Bell className="w-5 h-5" />
          </Badge>
        </button>
      }
      align="right"
    >
      <div className="w-80 md:w-96 flex flex-col max-h-[440px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6D8F1]/40 bg-purple-50/30">
          <div className="flex items-center gap-2">
            <span className="font-quicksand font-bold text-sm text-purple-600">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-teal-500 text-white rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto divide-y divide-[#E6D8F1]/30">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markItemRead(item.id)}
                className={`p-3.5 flex items-start gap-3 hover:bg-purple-50/40 cursor-pointer transition-colors ${
                  !item.read ? 'bg-purple-50/20' : ''
                }`}
              >
                <div className="mt-0.5 p-1.5 bg-white border border-[#E6D8F1]/60 rounded-btn shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs ${!item.read ? 'font-bold text-ink' : 'font-medium text-gray-700'} truncate`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Popover>
  );
}
