'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Spinner } from '@/app/utills/Spinner';
import FrontEndLayout from '@/app/layouts/FrontendLayout';
import Header from '@/app/components/Header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      // const productId = searchParams.get('product_id');

      if (!sessionId ) {
        setStatus('error');
        // setMessage('Invalid session');
        return;
      }

      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        if (!response.ok) throw new Error('Payment verification failed');

        setStatus('success');
        setMessage('Payment confirmed! Your pixels have been allocated.');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto p-6 mt-40">
      {status === 'verifying' && (
        <div className="text-center">
          <Spinner />
          <p className="mt-4">Confirming your payment...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-green-800">Success!</h2>
          <p className="mt-2 text-green-600">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-red-800">Error</h2>
          <p className="mt-2 text-red-600">{message}</p>
          <button
            onClick={() => router.push('/account')}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Go to Account
          </button>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <FrontEndLayout>
      <Header />
      <Suspense fallback={<div className="text-center mt-40"><Spinner /><p>Loading...</p></div>}>
        <SuccessContent />
      </Suspense>
    </FrontEndLayout>
  );
}
