'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { session } from '@/lib/auth/session';
import { Smartphone, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export default function OtpLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'contact' | 'otp'>('contact');
  const [contact, setContact] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError('Please enter your mobile number or email.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authApi.requestOtp(contact);
      setStep('otp');
      setResendCooldown(30);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not send OTP. Please verify your contact details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

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
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const code = digits.join('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await authApi.verifyOtp(contact, code);
      const data = res.data;

      if (data.accessToken && data.user) {
        session.setAccessToken(data.accessToken);
        session.setUserId(data.user.id);
        session.setRoleKey(data.user.roleKey);
        session.setBranchIds(data.user.branchIds);
        router.push('/dashboard');
        return;
      }

      setError('Invalid OTP code. Please try again.');
    } catch (err: unknown) {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        setError('Maximum OTP attempts reached. Please request a new code.');
        setStep('contact');
        setAttemptsLeft(5);
        setDigits(['', '', '', '', '', '']);
      } else {
        const message =
          err instanceof Error
            ? err.message
            : `Invalid OTP code. ${remaining} attempts remaining.`;
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      await authApi.requestOtp(contact);
      setResendCooldown(30);
      setDigits(['', '', '', '', '', '']);
      setAttemptsLeft(5);
    } catch {
      setError('Failed to resend OTP. Please try again.');
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
        <span>Staff sign in</span>
      </Link>

      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-btn bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
          <Smartphone className="w-6 h-6" />
        </div>
        <h1 className="font-quicksand font-bold text-2xl text-purple-600">
          Parent Sign In
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          {step === 'contact'
            ? 'Enter your registered phone number or email to receive a sign-in OTP.'
            : `Enter the 6-digit code sent to ${contact}.`}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-btn bg-danger-bg border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'contact' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            type="text"
            label="Phone number or Email"
            placeholder="+91 98765 43210 or parent@gmail.com"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            autoFocus
            disabled={loading}
          />

          <Button type="submit" variant="teal" fullWidth disabled={loading}>
            {loading ? 'Sending code...' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
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
            variant="teal"
            fullWidth
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('contact');
                setDigits(['', '', '', '', '', '']);
              }}
              className="text-gray-500 hover:text-ink underline"
            >
              Change number
            </button>

            <button
              type="button"
              disabled={resendCooldown > 0 || loading}
              onClick={handleResend}
              className="text-teal-700 hover:text-teal-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend code'}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
