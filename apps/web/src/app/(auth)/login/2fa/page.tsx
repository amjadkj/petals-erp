'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { session } from '@/lib/auth/session';
import { ShieldCheck, ArrowLeft, AlertCircle, QrCode } from 'lucide-react';

export default function TwoFactorPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupData, setSetupData] = useState<{ qrCode: string; manualKey: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [isSetupMode]);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

    // Auto advance
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const arr = pasted.split('');
      setDigits(arr);
      inputRefs.current[5]?.focus();
    }
  };

  const code = digits.join('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const tempToken =
        (typeof window !== 'undefined'
          ? sessionStorage.getItem('petals.tempToken')
          : null) ?? 'mock-temp-token';

      if (isSetupMode) {
        await authApi.enable2fa(code);
        setIsSetupMode(false);
        setDigits(['', '', '', '', '', '']);
        return;
      }

      const res = await authApi.verify2fa(tempToken, code);
      const data = ((res as any)?.data ?? res) as typeof res;

      if (data?.accessToken && data?.user) {
        session.setAccessToken(data.accessToken);
        session.setUserId(data.user.id);
        session.setRoleKey(data.user.roleKey);
        session.setBranchIds(data.user.branchIds);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('petals.tempToken');
        }
        router.push('/dashboard');
        return;
      }

      setError('Invalid verification code. Please try again.');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Invalid or expired verification code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.setup2fa();
      const setup = ((res as any)?.data ?? res) as { qrCode: string; manualKey: string };
      setSetupData(setup);
      setIsSetupMode(true);
    } catch {
      // Mock setup data for offline/test
      setSetupData({
        qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="%23F5EFFA"/><text x="80" y="85" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%236C3995">Scan Authenticator QR</text></svg>',
        manualKey: 'PETALS-2FA-AUTH-X992-KLO8',
      });
      setIsSetupMode(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-card border border-[#E6D8F1]/60 shadow-sm p-6 sm:p-8 animate-fade-in">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 font-medium mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to sign in</span>
      </Link>

      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-btn bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="font-quicksand font-bold text-2xl text-purple-600">
          {isSetupMode ? 'Set Up Two-Factor Auth' : 'Two-Factor Authentication'}
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          {isSetupMode
            ? 'Scan the QR code with Google Authenticator or enter the manual key below.'
            : 'Enter the 6-digit verification code from your authenticator app.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-btn bg-danger-bg border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Setup QR view for first-time Director */}
      {isSetupMode && setupData && (
        <div className="mb-6 p-4 rounded-card bg-purple-50/50 border border-purple-100 flex flex-col items-center text-center">
          <div className="w-40 h-40 bg-white border border-[#D9D4DE] rounded-btn p-2 flex items-center justify-center mb-3">
            <QrCode className="w-32 h-32 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Manual entry key:</p>
          <code className="text-xs font-mono font-bold text-purple-800 bg-white px-2 py-1 rounded border border-purple-200 select-all">
            {setupData.manualKey}
          </code>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Digit OTP inputs */}
        <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={idx === 0 ? 'one-time-code' : 'off'}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-12 text-center text-xl font-bold font-mono bg-white rounded-btn border border-[#D9D4DE] focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-colors"
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading || code.length !== 6}
        >
          {loading
            ? 'Verifying...'
            : isSetupMode
              ? 'Enable and verify'
              : 'Verify & Sign in'}
        </Button>
      </form>

      {/* First-time setup link */}
      {!isSetupMode && (
        <div className="mt-6 pt-4 border-t border-[#E6D8F1]/60 text-center">
          <button
            type="button"
            onClick={handleStartSetup}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium underline"
          >
            First time logging in as Director? Set up 2FA
          </button>
        </div>
      )}
    </div>
  );
}
