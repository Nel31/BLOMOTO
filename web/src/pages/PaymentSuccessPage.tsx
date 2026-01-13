import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';

/**
 * Page de succès après paiement FedaPay
 * 
 * Cette page est appelée après un paiement réussi.
 * Elle vérifie le statut de la transaction et affiche un message de confirmation.
 */
export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // Récupérer le transaction_id depuis l'URL
        const transactionId = searchParams.get('transaction_id');
        
        if (!transactionId) {
          setStatus('error');
          setMessage('Transaction ID manquant dans l\'URL');
          return;
        }

        // Vérifier le statut du paiement
        const paymentStatus = await paymentService.checkPaymentStatus(transactionId);
        
        if (paymentStatus.success && paymentStatus.status === 'SUCCESS') {
          setStatus('success');
          setMessage('Paiement effectué avec succès !');
        } else {
          setStatus('error');
          setMessage('Le paiement n\'a pas été confirmé. Veuillez contacter le support.');
        }
      } catch (error: any) {
        console.error('Erreur vérification paiement:', error);
        setStatus('error');
        setMessage(error.message || 'Erreur lors de la vérification du paiement');
      }
    };

    checkPayment();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/app');
  };

  const handleGoToAppointments = () => {
    navigate('/app/appointments');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-racine-50 to-racine-100 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeIn">
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <svg
                className="animate-spin h-16 w-16 mx-auto text-racine-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
              Vérification du paiement...
            </h2>
            <p className="text-gray-600">Veuillez patienter</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
              Paiement réussi ! ✅
            </h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoToAppointments}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: 'var(--color-racine-600)' }}
              >
                Voir mes rendez-vous
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--color-racine-600)',
                  border: '2px solid var(--color-racine-600)'
                }}
              >
                Retour à l'accueil
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
              Erreur de paiement ❌
            </h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoHome}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: 'var(--color-racine-600)' }}
              >
                Retour à l'accueil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

