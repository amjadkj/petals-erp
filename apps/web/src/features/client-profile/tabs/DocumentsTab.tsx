'use client';

import React, { useState } from 'react';
import { Switch, useToast } from '@/components/ui';
import { UploadCloud, File, Download, Calendar, Shield } from 'lucide-react';
import { RoleKey } from '@petals/types';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  sharedWithParent: boolean;
}

interface DocumentsTabProps {
  clientId: string;
  role: RoleKey;
}

const DEFAULT_DOCS: DocumentItem[] = [
  {
    id: 'd1',
    name: 'Hospital Developmental Assessment.pdf',
    type: 'External Medical Record',
    size: '2.4 MB',
    uploadedAt: '2026-10-02T00:00:00Z',
    sharedWithParent: true,
  },
  {
    id: 'd2',
    name: 'Audiology Hearing Evaluation.pdf',
    type: 'Clinical Screening',
    size: '1.1 MB',
    uploadedAt: '2026-10-05T00:00:00Z',
    sharedWithParent: true,
  },
  {
    id: 'd3',
    name: 'IEP Agreement & Consent Signoff.pdf',
    type: 'Consent Form',
    size: '850 KB',
    uploadedAt: '2026-10-10T00:00:00Z',
    sharedWithParent: false,
  },
];

export function DocumentsTab({ clientId: _clientId, role }: DocumentsTabProps) {
  const { showToast } = useToast();
  const [docs, setDocs] = useState<DocumentItem[]>(DEFAULT_DOCS);
  const [isDragging, setIsDragging] = useState(false);

  const isParent = role === RoleKey.PARENT;
  const isStaff = role !== RoleKey.PARENT;

  const handleToggleShare = (id: string, checked: boolean) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, sharedWithParent: checked } : d)),
    );
    showToast(
      checked
        ? 'Document is now accessible to parents in their portal.'
        : 'Document removed from parent portal view.',
      'info',
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    showToast('File uploaded successfully via signed URL flow!', 'success');
  };

  const visibleDocs = isParent
    ? docs.filter((d) => d.sharedWithParent)
    : docs;

  return (
    <div className="space-y-6">
      {/* Upload Dropzone for Staff */}
      {isStaff && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-card p-6 md:p-8 text-center transition-colors ${
            isDragging
              ? 'border-purple-600 bg-purple-50/50'
              : 'border-[#E6D8F1] bg-white hover:border-purple-300'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="font-semibold text-sm text-ink">
              Drag and drop external records or assessments here
            </div>
            <p className="text-xs text-gray-500 max-w-sm">
              Supports PDF, PNG, JPG up to 25MB. Files are encrypted with strict access control.
            </p>
            <label className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-btn text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 cursor-pointer transition-colors">
              Browse files
              <input
                type="file"
                className="hidden"
                onChange={() =>
                  showToast('File uploaded successfully via signed URL flow!', 'success')
                }
              />
            </label>
          </div>
        </div>
      )}

      {/* Document Records List */}
      <div className="bg-white border border-[#E6D8F1]/60 rounded-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E6D8F1]/40 flex items-center justify-between">
          <h3 className="font-quicksand font-bold text-base text-ink">
            Attached Documents & Records
          </h3>
          <span className="text-xs font-semibold text-gray-500">
            {visibleDocs.length} file{visibleDocs.length === 1 ? '' : 's'}
          </span>
        </div>

        {visibleDocs.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="divide-y divide-[#E6D8F1]/30">
            {visibleDocs.map((doc) => {
              const dateStr = new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={doc.id}
                  className="p-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-purple-50/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <File className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-ink truncate">
                        {doc.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                        <span className="text-purple-800 font-medium">{doc.type}</span>
                        <span>·</span>
                        <span>{doc.size}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{dateStr}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    {isStaff && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Shield className="w-3.5 h-3.5 text-teal-700" />
                        <span>Share with Parent</span>
                        <Switch
                          checked={doc.sharedWithParent}
                          onChange={(checked) => handleToggleShare(doc.id, checked)}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => showToast(`Downloading ${doc.name}...`, 'info')}
                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-btn transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
