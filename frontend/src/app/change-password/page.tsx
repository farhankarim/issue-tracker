'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react';
import Snackbar from '@/components/snackbar';
import { useAppStore } from '@/lib/store';

const CORRECT_OLD_PASSWORD = 'Admin@12345';

interface Criteria {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_CRITERIA: Criteria[] = [
  { label: 'Min 12 characters', test: (pw) => pw.length >= 12 },
  { label: 'Contains lowercase', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Contains uppercase', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Contains numbers', test: (pw) => /\d/.test(pw) },
  { label: 'Contains special characters', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrength(pw: string): { level: string; color: string; width: string } {
  const passed = PASSWORD_CRITERIA.filter((c) => c.test(pw)).length;
  if (passed <= 2) return { level: 'Weak', color: 'var(--error)', width: '33%' };
  if (passed <= 4) return { level: 'Medium', color: 'var(--warning)', width: '66%' };
  return { level: 'Strong', color: 'var(--success)', width: '100%' };
}

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowType = searchParams.get('flow') || '';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as 'error' | 'success' });

  const strength = useMemo(() => getStrength(newPassword), [newPassword]);
  const allCriteriaMet = PASSWORD_CRITERIA.every((c) => c.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';
  const canSubmit = allCriteriaMet && passwordsMatch && oldPassword !== '';

  const handleSubmit = () => {
    if (oldPassword !== CORRECT_OLD_PASSWORD) {
      setSnackbar({ visible: true, message: 'Old password is incorrect', type: 'error' });
      return;
    }

    setSnackbar({ visible: true, message: 'Password changed successfully', type: 'success' });

    setTimeout(() => {
      if (flowType === 'NewUser') {
        router.push('/verify-otp?flow=NewUser');
      } else {
        router.push('/login');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="text-[var(--on-surface)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Change Password</h1>
      </div>

      <div className="px-6 py-8 flex flex-col gap-5 max-w-sm mx-auto">
        {/* Old Password */}
        <div className="relative">
          <input
            type={showOld ? 'text' : 'password'}
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]"
          >
            {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* New Password */}
        <div>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Strength Indicator */}
          {newPassword && (
            <div className="mt-2">
              <div className="w-full h-2 bg-[var(--outline)]/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: strength.width, backgroundColor: strength.color }}
                />
              </div>
              <p className="text-xs mt-1 font-medium" style={{ color: strength.color }}>
                {strength.level}
              </p>
            </div>
          )}
        </div>

        {/* Re-enter New Password */}
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Password match indicator */}
        {confirmPassword && (
          <p className={`text-xs -mt-3 ${passwordsMatch ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </p>
        )}

        {/* Criteria Checklist */}
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-xs font-semibold text-[var(--on-surface-variant)]">Password Requirements</p>
          {PASSWORD_CRITERIA.map((criteria) => {
            const passed = criteria.test(newPassword);
            return (
              <div key={criteria.label} className="flex items-center gap-2">
                {passed ? (
                  <Check size={16} className="text-[var(--success)]" />
                ) : (
                  <X size={16} className="text-[var(--error)]" />
                )}
                <span
                  className={`text-xs ${passed ? 'text-[var(--success)]' : 'text-[var(--on-surface-variant)]'}`}
                >
                  {criteria.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50 mt-2"
        >
          Change Password
        </button>
      </div>

      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        visible={snackbar.visible}
        onClose={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
          <p className="text-[var(--on-surface-variant)]">Loading...</p>
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  );
}
