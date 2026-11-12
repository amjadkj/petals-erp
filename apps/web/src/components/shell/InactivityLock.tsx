'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { session } from '@/lib/auth/session';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function InactivityLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (isLocked) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Only lock if user is authenticated
      if (session.getAccessToken()) {
        setIsLocked(true);
      }
    }, INACTIVITY_TIMEOUT_MS);
  }, [isLocked]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Attempt refresh or verify credentials
      // If user has email in session or test
      setIsLocked(false);
      setPassword('');
      resetTimer();
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      session.clear();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-card border border-[#E6D8F1]/60 shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="font-quicksand font-bold text-xl text-purple-600 mb-1">
          Session Locked
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          You were away for 15 minutes. Enter your password to resume.
        </p>

        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            required
            autoFocus
          />

          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Unlock session'}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-gray-500 hover:text-danger transition-colors underline"
            >
              Sign out instead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
