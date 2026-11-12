'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import { usePageTitle } from '@/lib/context/PageTitleContext';

export default function ForbiddenPage() {
  const router = useRouter();
  usePageTitle('Access Denied');

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-card border border-[#E6D8F1]/60 shadow-sm max-w-md w-full p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-danger-bg text-danger flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-quicksand font-bold text-2xl text-purple-600 mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          You don&apos;t have permission to view this section. If you believe this is an error, please contact your Clinic Director.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
