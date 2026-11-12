import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card border border-[#E6D8F1]/60 shadow-sm max-w-md w-full p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="font-quicksand font-bold text-3xl text-purple-600 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          We couldn&apos;t find the milestone you were looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <Link href="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
