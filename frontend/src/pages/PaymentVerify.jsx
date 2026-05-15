import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function PaymentVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const reference = params.get('reference');
    if (!reference) { setStatus('error'); return; }

    api.get(`/payments/paystack/verify?reference=${reference}`)
      .then((r) => {
        setStatus('success');
        setTimeout(() => navigate(`/orders`), 2500);
      })
      .catch(() => setStatus('error'));
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-sm w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Verifying Payment…</h2>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mt-2">Redirecting to your orders…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500 text-sm mt-2">Please try again or contact support.</p>
            <button onClick={() => navigate('/cart')} className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700">
              Back to Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}
