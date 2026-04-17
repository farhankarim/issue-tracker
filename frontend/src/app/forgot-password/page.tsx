'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LoadingOverlay from '@/components/loading-overlay';
import Snackbar from '@/components/snackbar';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' as const });

  const handleGenerateOtp = () => {
    if (!loginId.trim()) {
      setSnackbar({ visible: true, message: 'Please enter your Login ID', type: 'error' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/verify-otp?flow=ForgotPassword');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--outline)]/20 px-4 py-3 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="text-[var(--on-surface)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--on-surface)]">Forgot Password</h1>
      </div>

      <div className="px-6 py-8 flex flex-col gap-5 max-w-sm mx-auto">
        <p className="text-sm text-[var(--on-surface-variant)]">
          Enter your Login ID to receive a one-time password on your registered phone number.
        </p>

        {/* Login ID */}
        <input
          type="text"
          placeholder="Login ID"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerateOtp()}
          className="w-full px-4 py-3 rounded-xl border border-[var(--outline)] bg-transparent text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
        />

        {/* Generate OTP Button */}
        <button
          type="button"
          onClick={handleGenerateOtp}
          className="w-full py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-medium text-sm hover:opacity-90 disabled:opacity-50"
        >
          Generate OTP
        </button>
      </div>

      <LoadingOverlay visible={loading} />

      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        visible={snackbar.visible}
        onClose={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />
    </div>
  );
}
