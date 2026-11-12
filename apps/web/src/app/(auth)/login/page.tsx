'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { session } from '@/lib/auth/session';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      const data = res.data;

      if (data.requires2FA && data.tempToken) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('petals.tempToken', data.tempToken);
        }
        router.push('/login/2fa');
        return;
      }

      if (data.accessToken && data.user) {
        session.setAccessToken(data.accessToken);
        session.setUserId(data.user.id);
        session.setRoleKey(data.user.roleKey);
        session.setBranchIds(data.user.branchIds);
        router.push('/dashboard');
        return;
      }

      setError('Unexpected response from server.');
    } catch (err: unknown) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setLockoutSeconds(60);
        setError('Too many failed attempts. Please wait 60 seconds before trying again.');
      } else {
        const message =
          err instanceof Error
            ? err.message
            : 'Invalid email or password. Please check your credentials.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutSeconds > 0;

  return (
    <div className="w-full max-w-[420px] bg-white rounded-card border border-[#E6D8F1]/60 shadow-sm p-6 sm:p-8 animate-fade-in">
      {/* Brand logo & caption */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-btn bg-purple-600 flex items-center justify-center text-white mb-2 shadow-sm">
          <span className="font-quicksand font-bold text-2xl leading-none">P</span>
        </div>
        <h1 className="font-quicksand font-bold text-2xl text-purple-600">
          Welcome back
        </h1>
        <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-1">
          Petals Child Development Centre
        </p>
      </div>

      {/* Lockout Warning */}
      {isLocked && (
        <div className="mb-4 p-3 rounded-btn bg-danger-bg border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Account locked. Please retry in <strong>{lockoutSeconds}s</strong>
          </span>
        </div>
      )}

      {/* General Error */}
      {error && !isLocked && (
        <div className="mb-4 p-3 rounded-btn bg-danger-bg border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email address"
          placeholder="name@petals.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading || isLocked}
        />

        <div className="space-y-1">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading || isLocked}
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-ink focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
          />
          <div className="flex justify-end pt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading || isLocked}
          className="mt-2"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Alternative parent sign-in */}
      <div className="mt-6 pt-5 border-t border-[#E6D8F1]/60 text-center">
        <p className="text-xs text-gray-500">
          Parent or guardian?{' '}
          <Link
            href="/login/otp"
            className="text-teal-700 hover:text-teal-900 font-semibold underline ml-1"
          >
            Sign in with OTP
          </Link>
        </p>
      </div>
    </div>
  );
}
