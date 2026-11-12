'use client';

import React, { useEffect, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { BottomSheet } from './BottomSheet';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  isDirty?: boolean;
  className?: string;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  isDirty = false,
  className,
  maxWidth = 'max-w-[480px]',
}: ModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClose = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Discard them?')) {
        return;
      }
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen && !isMobile) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isMobile, isDirty]);

  if (!isOpen) return null;

  // Render BottomSheet on mobile
  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        footer={footer}
        className={className}
      >
        {children}
      </BottomSheet>
    );
  }

  // Desktop Centred Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      {/* Scrim */}
      <div className="absolute inset-0" onClick={handleClose} aria-hidden="true" />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-white rounded-card border border-[#E6D8F1]/60 shadow-xl overflow-hidden flex flex-col max-h-[90vh]',
          maxWidth,
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6D8F1]/40">
          <h2 className="font-quicksand font-bold text-lg text-purple-600">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-btn text-gray-400 hover:text-ink hover:bg-purple-50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Sticky Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#E6D8F1]/40 bg-white flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
