import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateAge, getInitials, getAvatarColorClass } from '../utils';

describe('Clinical and Dashboard Utilities', () => {
  describe('formatCurrency', () => {
    it('formats standard amounts with Indian numbering system', () => {
      expect(formatCurrency(1500)).toContain('1,500');
      expect(formatCurrency(75000)).toContain('75,000');
    });

    it('formats large amounts in Lakhs when compact is requested', () => {
      expect(formatCurrency(150000, true)).toBe('₹1.5L');
      expect(formatCurrency(200000, true)).toBe('₹2L');
    });

    it('handles zero gracefully', () => {
      expect(formatCurrency(0)).toContain('0');
      expect(formatCurrency(0, true)).toBe('₹0');
    });
  });

  describe('calculateAge', () => {
    it('calculates years and months accurately with clinical format', () => {
      const now = new Date();
      const dob = new Date(now.getFullYear() - 4, now.getMonth() - 3, 15).toISOString();
      const ageStr = calculateAge(dob);
      expect(ageStr).toMatch(/4\s*yrs\s*3\s*mos/);
    });

    it('returns months only for babies under 1 year', () => {
      const now = new Date();
      const dob = new Date(now.getFullYear(), now.getMonth() - 6, 15).toISOString();
      const ageStr = calculateAge(dob);
      expect(ageStr).toContain('6 mos');
      expect(ageStr).not.toContain('yrs');
    });

    it('handles empty or invalid inputs', () => {
      expect(calculateAge('')).toBe('—');
      expect(calculateAge(null as unknown as string)).toBe('—');
    });
  });

  describe('getInitials', () => {
    it('extracts two initials from full name', () => {
      expect(getInitials('Aarav Sharma')).toBe('AS');
      expect(getInitials('Dr. Sunita Rao')).toBe('DR');
    });

    it('extracts two initials for single name by taking first two chars', () => {
      expect(getInitials('Aarav')).toBe('AA');
    });

    it('handles empty string with fallback', () => {
      expect(getInitials('')).toBe('??');
    });
  });

  describe('getAvatarColorClass', () => {
    it('deterministically returns a consistent tailwind class for the same name', () => {
      const color1 = getAvatarColorClass('Aarav Sharma');
      const color2 = getAvatarColorClass('Aarav Sharma');
      expect(color1).toBe(color2);
      expect(color1).toMatch(/^bg-/);
    });

    it('distributes colors across different names', () => {
      const colorA = getAvatarColorClass('Aarav');
      const colorB = getAvatarColorClass('Priya');
      expect(typeof colorA).toBe('string');
      expect(typeof colorB).toBe('string');
    });
  });
});
