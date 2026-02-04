import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { api } from '../../api/client';

const stripeKey = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY;
// Ne pas appeler loadStripe avec une clé vide pour éviter l'erreur d'initialisation
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface PaymentFormProps {
  appointmentId: string;
  amount: number;
  onSuccess: () => void;
  onCancel?: () => void;
}

function PaymentFormContent({ appointmentId, amount, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Créer l'intention de paiement
    const createIntent = async () => {
      try {
        const res = await api.post('/payments/create-intent', {
          appointmentId,
          amount,
        });
        setClientSecret(res.data.clientSecret);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors de la création du paiement');
      }
    };

    createIntent();
  }, [appointmentId, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Élément de carte non trouvé');
      setProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Erreur lors du paiement');
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirmer le paiement côté backend
        await api.post('/payments/confirm', {
          paymentIntentId: paymentIntent.id,
          appointmentId,
        });

        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border" style={{ borderColor: 'var(--color-racine-200)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
          Informations de paiement
        </h3>

        <div className="p-4 border-2 rounded-lg" style={{ borderColor: 'var(--color-racine-200)' }}>
          <CardElement options={cardElementOptions} />
        </div>

        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-racine-50)' }}>
          <div className="flex justify-between items-center">
            <span className="font-semibold" style={{ color: 'var(--color-noir-700)' }}>Total à payer (XOF):</span>
            <span className="text-xl font-bold" style={{ color: 'var(--color-rouge-600)' }}>
              {amount.toLocaleString()} XOF
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: 'var(--color-noir-200)', color: 'var(--color-noir-700)' }}
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={!stripe || processing || !clientSecret}
            className="flex-1 px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
          >
            <span className="relative z-10">
              {processing ? 'Traitement...' : `Payer ${amount.toLocaleString()} XOF`}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    // stripePromise est null si la clé n'est pas fournie
    if (stripePromise) {
      setStripeReady(true);
    }
  }, []);

  if (!stripeReady || !stripePromise) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
        <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>
          Stripe n'est pas configuré. Configurez VITE_STRIPE_PUBLISHABLE_KEY dans votre .env
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}

