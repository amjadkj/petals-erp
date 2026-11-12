'use client';

import React from 'react';
import { Modal, Switch, Button } from '@/components/ui';
import { WidgetConfig } from './types';
import { GripVertical } from 'lucide-react';

interface ConfigureWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onSave: (newWidgets: WidgetConfig[]) => void;
  onReset: () => void;
}

export function ConfigureWidgetsModal({
  isOpen,
  onClose,
  widgets,
  onSave,
  onReset,
}: ConfigureWidgetsModalProps) {
  const [localWidgets, setLocalWidgets] = React.useState<WidgetConfig[]>(widgets);

  React.useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets, isOpen]);

  const handleToggle = (id: string, checked: boolean) => {
    setLocalWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: checked } : w)),
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setLocalWidgets((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === localWidgets.length - 1) return;
    setLocalWidgets((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleApply = () => {
    onSave(localWidgets);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Widgets"
      maxWidth="max-w-[480px]"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="text-gray-500 hover:text-ink text-xs font-semibold px-2 py-1 rounded transition-colors"
          >
            Reset defaults
          </button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-3 text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleApply}
              className="h-9 px-3 text-xs md:text-sm"
            >
              Save preferences
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-500 font-medium">
          Toggle visibility and reorder dashboard widgets for your workspace.
        </p>

        <div className="divide-y divide-[#E6D8F1]/40 border border-[#E6D8F1]/60 rounded-card overflow-hidden">
          {localWidgets.map((w, idx) => (
            <div
              key={w.id}
              className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-purple-50/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col gap-0.5 text-gray-400">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="hover:text-purple-600 disabled:opacity-20 text-[10px] leading-none"
                    aria-label="Move widget up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === localWidgets.length - 1}
                    className="hover:text-purple-600 disabled:opacity-20 text-[10px] leading-none"
                    aria-label="Move widget down"
                  >
                    ▼
                  </button>
                </div>
                <GripVertical className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-semibold text-ink">{w.label}</span>
              </div>

              <div>
                <Switch
                  checked={w.enabled}
                  onChange={(checked) => handleToggle(w.id, checked)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
