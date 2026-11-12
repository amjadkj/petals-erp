'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Users, UserCog, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { AppModule, PermissionAction } from '@petals/types';

interface SearchResultItem {
  id: string;
  type: 'client' | 'employee' | 'lead';
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { can } = usePermissions();

  const canViewClients = can(AppModule.CLIENTS, PermissionAction.VIEW);
  const canViewEmployees = can(AppModule.EMPLOYEES, PermissionAction.VIEW);
  const canViewLeads = can(AppModule.LEADS, PermissionAction.VIEW);

  // Global / or Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Outside click to close results
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Mock results filtered by query and permissions
  const mockResults: SearchResultItem[] = [
    {
      id: 'c-1',
      type: 'client',
      title: 'Aarav Sharma',
      subtitle: 'Code: PT-0102 · Speech Therapy',
      href: '/clients/c-1',
    },
    {
      id: 'c-2',
      type: 'client',
      title: 'Vihaan Nair',
      subtitle: 'Code: PT-0105 · Occupational Therapy',
      href: '/clients/c-2',
    },
    {
      id: 'e-1',
      type: 'employee',
      title: 'Dr. Sneha Menon',
      subtitle: 'Senior Speech Therapist',
      href: '/employees/e-1',
    },
    {
      id: 'l-1',
      type: 'lead',
      title: 'Ananya Pillai',
      subtitle: 'Stage: Assessment Scheduled',
      href: '/leads',
    },
  ];

  const filteredResults = query.trim()
    ? mockResults.filter((item) => {
        if (item.type === 'client' && !canViewClients) return false;
        if (item.type === 'employee' && !canViewEmployees) return false;
        if (item.type === 'lead' && !canViewLeads) return false;
        return (
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
        );
      })
    : [];

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'client':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'employee':
        return <UserCog className="w-4 h-4 text-teal-700" />;
      case 'lead':
        return <Filter className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs md:max-w-md">
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search Petals… (Ctrl+K)"
          className="w-full h-10 pl-9 pr-9 bg-gray-50/80 hover:bg-white text-xs md:text-sm rounded-btn border border-[#D9D4DE] focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-colors"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-gray-400 hover:text-ink"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block absolute right-3 text-[10px] uppercase font-mono px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded border border-gray-200 pointer-events-none">
            /
          </kbd>
        )}
      </div>

      {/* Popover results */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-card border border-[#E6D8F1]/60 shadow-xl overflow-hidden z-50 animate-fade-in max-h-80 overflow-y-auto divide-y divide-[#E6D8F1]/30">
          {filteredResults.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="p-3 flex items-center gap-3 hover:bg-purple-50/50 cursor-pointer transition-colors"
              >
                <div className="p-2 bg-purple-50 rounded-btn shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-semibold text-ink truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{item.subtitle}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
