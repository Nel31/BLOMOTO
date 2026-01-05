import { useNavigate } from 'react-router-dom';

/**
 * Page d'annulation après paiement KKIAPAY
 * 
 * Cette page est appelée lorsque l'utilisateur annule le paiement
 * ou que le paiement échoue.
 */
export default function PaymentCancelPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/app');
  };

  const handleGoToAppointments = () => {
    navigate('/app/appointments');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-racine-50 to-racine-100 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeIn">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
          Paiement annulé ⚠️
        </h2>
        <p className="text-gray-600 mb-8">
          Votre paiement a été annulé. Aucun montant n'a été débité.
          <br />
          <br />
          Vous pouvez réessayer plus tard ou contacter le support si vous avez des questions.
        </p>
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
      </div>
    </div>
  );
}

