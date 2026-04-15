'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Snackbar from '@/components/snackbar';

const CORRECT_OTP = '1234';
const OTP_DURATION = 60;

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowType = searchParams.get('flow') || '';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(OTP_DURATION);
  const [expired, setExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) {
      setExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const navigateOnSuccess = useCallback(() => {
    switch (flowType) {
      case 'NewUser':
        router.push('/change-password?flow=NewUser');
        break;
      case 'NewDevice':
        router.push('/shift-start');
        break;
      case 'ForgotPassword':
        router.push('/change-password?flow=ForgotPassword');
        break;
      default:
        router.push('/login');
    }
  }, [flowType, router]);

  const verifyOtp = useCallback(
    (code: string) => {
      if (code !== CORRECT_OTP) {
        setSnackbar({ visible: true, message: 'Invalid OTP. Please try again.', type: 'error' });
        return;
      }

      setSnackbar({ visible: true, message: 'OTP verified successfully!', type: 'success' });
      setTimeout(() => navigateOnSuccess(), 500);
    },
    [navigateOnSuccess],
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const digit = value.slice(-1);
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit on last digit
      if (digit && index === 3) {
        const fullOtp = newOtp.join('');
        if (fullOtp.length === 4) {
          verifyOtp(fullOtp);
        }
      }
    },
    [otp, verifyOtp],
  );

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 4) {
      setSnackbar({ visible: true, message: 'Please enter all 4 digits', type: 'error' });
      return;
    }
    verifyOtp(fullOtp);
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '']);
    setTimer(OTP_DURATION);
    setExpired(false);
    inputRefs.current[0]?.focus();
    setSnackbar({ visible: true, message: 'OTP has been resent', type: 'success' });
  };

  const allDigitsEntered = otp.every((d) => d !== '');
  const formatTimer = `0:${timer.toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="text-[var(--on-surface)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Verify OTP</h1>
      </div>

      <div className="px-6 py-8 flex flex-col items-center">
        {/* Subtitle */}
        <p className="text-sm text-[var(--on-surface-variant)] text-center mb-8">
          A 4-digit OTP has been sent to your registered phone number.
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-4 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={expired}
              className="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-[var(--outline)] bg-transparent text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:opacity-50"
            />
          ))}
        </div>

        {/* Timer */}
        {!expired ? (
          <p className="text-sm text-[var(--on-surface-variant)] mb-6">
            OTP expires in: <span className="font-semibold text-[var(--primary)]">{formatTimer}</span>
          </p>
        ) : (
          <p className="text-sm text-[var(--error)] font-medium mb-6">OTP expired</p>
        )}

        {/* Actions */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            type="button"
            onClick={handleVerify}
            disabled={!allDigitsEntered || expired}
            className="w-full py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50"
          >
            Verify
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            className="w-full py-3 border border-[var(--outline)] text-[var(--primary)] rounded-full font-medium text-sm"
          >
            Generate OTP Again
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full py-3 border border-[var(--outline)] text-[var(--primary)] rounded-full font-medium text-sm"
          >
            Back to Login
          </button>
        </div>
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

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
          <p className="text-[var(--on-surface-variant)]">Loading...</p>
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
