'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Snackbar from '@/components/snackbar';
import AlertDialog from '@/components/alert-dialog';

const BLOCK_DURATION_MS = 15 * 60 * 1000;

const USERS: { loginId: string; password: string; name: string; email: string; role: string }[] = [
  { loginId: 'user01', password: 'Admin@12345', name: 'Sales User', email: 'user01@example.com', role: 'sales_rep' },
  { loginId: 'Christine_Brakus56@yahoo.com', password: 'farhan', name: 'Christine Brakus', email: 'Christine_Brakus56@yahoo.com', role: 'sales_rep' },
];

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    incrementFailedLogin,
    resetFailedLogin,
    blockAccount,
    permanentlyBlockAccount,
    failedLoginAttempts,
    accountBlockedUntil,
    accountPermanentlyBlocked,
    deviceRegistered,
    fingerprintEnabled,
  } = useAppStore();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as const });
  const [alert, setAlert] = useState({ open: false, title: '', message: '' });
  const [countdown, setCountdown] = useState<number | null>(null);

  // Countdown timer for temporary block
  useEffect(() => {
    if (!accountBlockedUntil) {
      setCountdown(null);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, accountBlockedUntil - Date.now());
      if (remaining <= 0) {
        setCountdown(null);
        return;
      }
      setCountdown(Math.ceil(remaining / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [accountBlockedUntil]);

  const isTemporarilyBlocked = countdown !== null && countdown > 0;

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const navigateAfterLogin = useCallback(() => {
    if (deviceRegistered) {
      router.push('/shift-start');
    } else {
      router.push('/verify-otp?flow=NewUser');
    }
  }, [deviceRegistered, router]);

  const handleLogin = () => {
    if (!loginId.trim() || !password.trim()) {
      setSnackbar({ visible: true, message: 'Please enter both Login ID and Password', type: 'error' });
      return;
    }

    // Correct credentials always succeed — reset any lockout state
    const matchedUser = USERS.find(u => u.loginId === loginId && u.password === password);
    if (matchedUser) {
      resetFailedLogin();
      login({ name: matchedUser.name, email: matchedUser.email, role: matchedUser.role, loginId: matchedUser.loginId });
      navigateAfterLogin();
      return;
    }

    // Wrong credentials — enforce lockout before incrementing
    if (accountPermanentlyBlocked) {
      setSnackbar({ visible: true, message: 'Account is permanently blocked', type: 'error' });
      return;
    }

    if (isTemporarilyBlocked) {
      setSnackbar({ visible: true, message: 'Account is temporarily blocked. Please wait.', type: 'error' });
      return;
    }

    const newAttempts = failedLoginAttempts + 1;
    incrementFailedLogin();

    if (newAttempts >= 5) {
      permanentlyBlockAccount();
      setAlert({
        open: true,
        title: 'Account Permanently Blocked',
        message: 'Your account has been permanently blocked due to too many failed login attempts. Please contact your administrator.',
      });
    } else if (newAttempts >= 3) {
      const until = Date.now() + BLOCK_DURATION_MS;
      blockAccount(until);
      setAlert({
        open: true,
        title: 'Account Temporarily Blocked',
        message: 'Account temporarily blocked for 15 minutes due to multiple failed login attempts.',
      });
    } else {
      setSnackbar({ visible: true, message: 'Invalid Login ID or Password', type: 'error' });
    }
  };

  const handleFingerprintLogin = () => {
    resetFailedLogin();
    login({ name: 'Sales User', email: 'user01@example.com', role: 'sales_rep', loginId: 'user01' });
    router.push('/shift-start');
  };

  // Only disable the button for permanently blocked accounts — a temporarily
  // blocked user can still log in with the correct credentials.
  const loginDisabled = accountPermanentlyBlocked;

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col items-center justify-center px-6 py-12">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-[var(--primary-container)] flex items-center justify-center mb-6">
        <User size={48} className="text-[var(--primary)]" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-[var(--on-surface)] mb-10">Sales CRM</h1>

      {/* Form */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Login ID */}
        <input
          type="text"
          placeholder="Login ID"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/forgot-password')}
            className="text-sm text-[var(--primary)] font-medium"
          >
            Forgot Password?
          </button>
        </div>

        {/* Block Timer */}
        {isTemporarilyBlocked && (
          <div className="text-center text-sm text-[var(--error)] font-medium py-2">
            Account blocked. Try again in {formatCountdown(countdown)}
          </div>
        )}

        {accountPermanentlyBlocked && (
          <div className="text-center text-sm text-[var(--error)] font-medium py-2">
            Account permanently blocked. Contact administrator.
          </div>
        )}

        {/* Login Button */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loginDisabled}
          className="w-full py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50"
        >
          Login
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[var(--outline)]/30" />
          <span className="text-xs text-[var(--on-surface-variant)]">OR</span>
          <div className="flex-1 h-px bg-[var(--outline)]/30" />
        </div>

        {/* Fingerprint Login */}
        {fingerprintEnabled && (
          <button
            type="button"
            onClick={handleFingerprintLogin}
            className="w-full py-3 border border-[var(--outline)] text-[var(--primary)] rounded-full font-medium text-sm flex items-center justify-center gap-2"
          >
            <Fingerprint size={20} />
            Login with Fingerprint
          </button>
        )}
      </div>

      {/* Snackbar */}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        visible={snackbar.visible}
        onClose={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alert.open}
        title={alert.title}
        message={alert.message}
        confirmLabel="OK"
        onConfirm={() => setAlert((a) => ({ ...a, open: false }))}
      />
    </div>
  );
}
