'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success'>('loading');

  useEffect(() => {
    // Brief loading state then show success
    const timer = setTimeout(() => {
      setStatus('success');
    }, 1500);

    // Redirect to dashboard after 4 seconds
    const redirect = setTimeout(() => {
      router.push('/dashboard');
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirect);
    };
  }, [router, sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center max-w-md mx-auto px-6">
        {status === 'loading' ? (
          <>
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Processing payment...</h1>
            <p className="text-white/40">Please wait while we confirm your payment.</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-white/40 mb-6">
              Your rental is now active. Redirecting to dashboard...
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
