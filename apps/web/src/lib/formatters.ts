import { format, parseISO, isValid } from 'date-fns';

export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRLakhs(amount: number): string {
  if (isNaN(amount)) return '₹0';
  if (Math.abs(amount) >= 100000) {
    const inLakhs = (amount / 100000).toFixed(2);
    return `₹${inLakhs.replace(/\.00$/, '')}L`;
  }
  return formatINR(amount);
}

export function formatDateSafe(
  dateInput?: string | Date | null,
  pattern = 'dd MMM yyyy',
): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return '—';
    return format(d, pattern);
  } catch {
    return '—';
  }
}

export function computeAge(dob?: string | null): string {
  if (!dob) return 'Child';
  try {
    const birth = parseISO(dob);
    if (!isValid(birth)) return 'Child';
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    return `Child · ${Math.max(0, years)} years`;
  } catch {
    return 'Child';
  }
}
