'use client';

import React, { useState } from 'react';
import { usePageTitle } from '@/lib/context/PageTitleContext';
import { BranchSwitcher } from './BranchSwitcher';
import { GlobalSearch } from './GlobalSearch';
import { NotificationsPopover } from './NotificationsPopover';
import { UserMenu } from './UserMenu';
import { MobileDrawer } from './MobileDrawer';
import { Menu, Search, Building2, X } from 'lucide-react';
import { usePermissionsStore } from '@/lib/permissions/store';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { branchesApi } from '@/lib/api/branches';
import { BranchDto, RoleKey } from '@petals/types';

export function Header() {
  const { title } = usePageTitle();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileBranchOpen, setMobileBranchOpen] = useState(false);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const { selectedBranchId, setSelectedBranchId, roleKey } = usePermissionsStore();

  const handleOpenBranchSheet = async () => {
    try {
      const res = await branchesApi.getBranches();
      if (res?.data) setBranches(res.data);
    } catch {
      // fallback
      setBranches([
        {
          id: 'b-kaloor',
          name: 'Kaloor Main',
          code: 'KL',
          city: 'Kochi',
          address: 'Kaloor, Kochi',
          phone: '+91 9876543210',
          timezone: 'Asia/Kolkata',
          isActive: true,
        },
      ]);
    }
    setMobileBranchOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-20 w-full bg-white border-b border-[#E6D8F1]/60 px-4 md:px-8 h-16 md:h-[88px] flex items-center justify-between gap-4">
        {/* Mobile Left: Hamburger + Page Title */}
        <div className="flex md:hidden items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="p-1.5 -ml-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-btn transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-quicksand font-bold text-lg text-purple-600 truncate">
            {title}
          </h1>
        </div>

        {/* Desktop Left: Page Title */}
        <div className="hidden md:flex items-center min-w-0">
          <h1 className="font-quicksand font-bold text-2xl text-purple-600 truncate">
            {title}
          </h1>
        </div>

        {/* Desktop Center: Branch Switcher & Global Search */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-4">
          <BranchSwitcher />
          <GlobalSearch />
        </div>

        {/* Mobile Right Controls */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Search"
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-btn transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile branch switcher button */}
          <button
            type="button"
            onClick={handleOpenBranchSheet}
            aria-label="Switch branch"
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-btn transition-colors"
          >
            <Building2 className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <NotificationsPopover />

          {/* User Menu avatar */}
          <UserMenu
            name="Priya Nair"
            role={roleKey ? roleKey.toLowerCase() : 'Director'}
            customTrigger={
              <div className="p-1 rounded-full cursor-pointer hover:ring-2 hover:ring-purple-200">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                  PN
                </div>
              </div>
            }
          />
        </div>

        {/* Desktop Right Controls: Bell + User Chip */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <NotificationsPopover />
          <div className="h-6 w-px bg-[#E6D8F1]/60" />
          <UserMenu
            name="Priya Nair"
            role={roleKey ? roleKey.toLowerCase() : 'Director'}
          />
        </div>
      </header>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-b border-[#E6D8F1]/60 px-4 py-2.5 flex items-center gap-2 animate-fade-in">
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-gray-400 hover:text-ink"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Mobile Branch BottomSheet */}
      <BottomSheet
        isOpen={mobileBranchOpen}
        onClose={() => setMobileBranchOpen(false)}
        title="Select Branch"
      >
        <div className="space-y-2 py-2">
          {roleKey === RoleKey.DIRECTOR && (
            <button
              type="button"
              onClick={() => {
                setSelectedBranchId('ALL');
                setMobileBranchOpen(false);
              }}
              className={`w-full text-left p-3.5 rounded-card border transition-colors flex items-center justify-between ${
                selectedBranchId === 'ALL'
                  ? 'border-purple-600 bg-purple-50 text-purple-800 font-semibold'
                  : 'border-[#E6D8F1]/60 text-ink'
              }`}
            >
              <span>All Branches</span>
              {selectedBranchId === 'ALL' && (
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              )}
            </button>
          )}

          {branches.map((b) => {
            const isSelected = selectedBranchId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBranchId(b.id);
                  setMobileBranchOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-card border transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 text-purple-800 font-semibold'
                    : 'border-[#E6D8F1]/60 text-ink'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.city} · {b.code}</p>
                </div>
                {isSelected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
