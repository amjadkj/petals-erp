'use client';

import React, { ReactNode } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

export interface FiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  onReset?: () => void;
  children: ReactNode;
}

export function FiltersSheet({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
}: FiltersSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      footer={
        <div className="flex items-center justify-between gap-3">
          {onReset && (
            <Button variant="outline" onClick={onReset}>
              Reset
            </Button>
          )}
          <Button
            variant="primary"
            fullWidth={!onReset}
            onClick={() => {
              onApply?.();
              onClose();
            }}
          >
            Apply Filters
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">{children}</div>
    </BottomSheet>
  );
}
