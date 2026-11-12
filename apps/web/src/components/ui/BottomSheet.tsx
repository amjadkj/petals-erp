'use client';

import React, { useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Scrim tap */}
      <div className="absolute inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      {/* Sheet Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'w-full max-h-[90vh] bg-white rounded-t-[16px] flex flex-col shadow-2xl overflow-hidden animate-slide-up',
          className,
        )}
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center cursor-grab">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E6D8F1]/40">
            <h2 className="font-quicksand font-bold text-lg text-purple-600">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-btn text-gray-400 hover:text-ink hover:bg-purple-50 transition-colors"
              aria-label="Close sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Sticky Footer */}
        {footer && (
          <div className="p-4 border-t border-[#E6D8F1]/40 bg-white sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
