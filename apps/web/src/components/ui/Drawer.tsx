'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { BottomSheet } from './BottomSheet';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  width?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  width = 'max-w-[400px]',
}: DrawerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && !isMobile) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isMobile, onClose]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title} footer={footer} className={className}>
        {children}
      </BottomSheet>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Scrim tap */}
      <div className="absolute inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      {/* Drawer surface */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'w-full h-full bg-white shadow-2xl flex flex-col border-l border-[#E6D8F1]/60 animate-slide-left',
          width,
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6D8F1]/40">
          <h2 className="font-quicksand font-bold text-lg text-purple-600">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-btn text-gray-400 hover:text-ink hover:bg-purple-50 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Sticky Footer */}
        {footer && (
          <div className="p-5 border-t border-[#E6D8F1]/40 bg-white sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
