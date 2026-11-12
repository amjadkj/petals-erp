import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, shorthand = false): string {
  if (isNaN(amount)) return '₹0';
  if (shorthand && amount >= 100000) {
    const inLakhs = (amount / 100000).toFixed(1).replace(/\.0$/, '');
    return `₹${inLakhs}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function calculateAge(dobString?: string | null): string {
  if (!dobString) return '—';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '—';

  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
    years--;
    months = (months + 12) % 12;
  }

  if (years === 0) {
    return `${months} mo${months === 1 ? '' : 's'}`;
  }
  if (months === 0) {
    return `${years} yr${years === 1 ? '' : 's'}`;
  }
  return `${years} yr${years === 1 ? '' : 's'} ${months} mo${months === 1 ? '' : 's'}`;
}

export function getInitials(name?: string | null): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColorClass(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Alternate purple and teal
  return Math.abs(hash) % 2 === 0
    ? 'bg-purple-100 text-purple-800'
    : 'bg-teal-50 text-teal-700';
}
