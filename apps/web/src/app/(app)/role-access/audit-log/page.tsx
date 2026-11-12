'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { RoleKey } from '@petals/types';
import {
  AuditLogHero,
  AuditLogFilterBar,
  AuditLogTable,
} from '@/features/audit-log';
import type { AuditLogFilterState, AuditLogDto } from '@/features/audit-log';
import { accessApi } from '@/lib/api/access';
import { branchesApi } from '@/lib/api/branches';
import type { UserSummary, BranchDto } from '@petals/types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function AuditLogPage() {
  usePageTitle('Audit log');
  const { myRole } = usePermissions();

  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [filters, setFilters] = useState<AuditLogFilterState>({
    userId: '',
    entity: '',
    branchId: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  // Load audit logs
  const loadLogs = useCallback(
    async (cursor?: string) => {
      try {
        if (cursor) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const queryParams: Record<string, string> = {
          limit: '25',
        };
        if (cursor) queryParams.cursor = cursor;
        if (filters.userId) queryParams.userId = filters.userId;
        if (filters.entity) queryParams.entity = filters.entity;
        if (filters.branchId) queryParams.branchId = filters.branchId;
        if (filters.startDate) queryParams.startDate = filters.startDate;
        if (filters.endDate) queryParams.endDate = filters.endDate;

        const res = await accessApi.getAuditLogs(queryParams);
        const data = (res.data as AuditLogDto[]) ?? [];
        const meta = res.meta as { nextCursor?: string | null; hasNext?: boolean } | undefined;

        if (cursor) {
          setLogs((prev) => [...prev, ...data]);
        } else {
          setLogs(data);
        }

        setNextCursor(meta?.nextCursor ?? null);
        setHasNextPage(Boolean(meta?.hasNext && meta?.nextCursor));
      } catch {
        if (!cursor) setLogs([]);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Load supporting entities for filters
  useEffect(() => {
    branchesApi
      .getUsers()
      .then((res) => {
        if (res && res.data) setUsers(res.data);
      })
      .catch(() => {});

    branchesApi
      .getBranches()
      .then((res) => {
        if (res && res.data) setBranches(res.data);
      })
      .catch(() => {});
  }, []);

  // Client-side text search filter
  const filteredLogs = useMemo(() => {
    if (!filters.search) return logs;
    const q = filters.search.toLowerCase();
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        (l.user?.name && l.user.name.toLowerCase().includes(q)) ||
        (l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q)),
    );
  }, [logs, filters.search]);

  // Director-only guard
  if (myRole && myRole !== RoleKey.DIRECTOR) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-8 bg-white border border-[#E6D8F1]/60 rounded-card text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-danger-bg text-danger mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-quicksand font-bold text-2xl text-ink">
          Director Access Required
        </h2>
        <p className="text-sm text-gray-500">
          The System Audit Log contains sensitive tracking records and is restricted strictly to clinic Directors.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <AuditLogHero />

      {/* Filter Bar */}
      <AuditLogFilterBar
        filters={filters}
        onChange={setFilters}
        users={users}
        branches={branches}
      />

      {/* Table with Cursor Pagination */}
      <AuditLogTable
        logs={filteredLogs}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoadingMore}
        onLoadMore={() => nextCursor && loadLogs(nextCursor)}
      />
    </div>
  );
}
