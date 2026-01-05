import { useState } from 'react';
import { paymentService, CreatePaymentParams } from '../../services/paymentService';
import { useAuthStore } from '../../store/auth';

interface KkiapayButtonProps {
  /** ID du rendez-vous (optionnel si invoiceId est fourni) */
  appointmentId?: string;
  /** ID de la facture (optionnel si appointmentId est fourni) */
  invoiceId?: string;
  /** Montant à payer */
  amount: number;
  /** Devise (par défaut: XOF) */
  currency?: string;
  /** Email du client (optionnel, utilise celui de l'utilisateur connecté par défaut) */
  customerEmail?: string;
  /** Téléphone du client (optionnel) */
  customerPhone?: string;
  /** Nom du client (optionnel) */
  customerName?: string;
  /** Callback appelé en cas de succès avant redirection */
  onSuccess?: () => void;
  /** Callback appelé en cas d'erreur */
  onError?: (error: string) => void;
  /** Texte personnalisé du bouton */
  buttonText?: string;
  /** Classes CSS personnalisées */
  className?: string;
  /** Désactiver le bouton */
  disabled?: boolean;
}

/**
 * Composant bouton de paiement KKIAPAY
 * 
 * Ce composant gère l'intégration complète du paiement KKIAPAY :
 * - Création de la transaction via le backend
 * - Redirection vers la page de paiement KKIAPAY
 * - Gestion des erreurs
 * 
 * @example
 * ```tsx
 * <KkiapayButton
 *   appointmentId="123"
 *   amount={5000}
 *   onSuccess={() => console.log('Paiement initié')}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 */
export default function KkiapayButton({
  appointmentId,
  invoiceId,
  amount,
  currency = 'XOF',
  customerEmail,
  customerPhone,
  customerName,
  onSuccess,
  onError,
  buttonText,
  className = '',
  disabled = false,
}: KkiapayButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  /**
   * Gère le clic sur le bouton de paiement
   */
  const handlePayment = async () => {
    // Validation
    if (!appointmentId && !invoiceId) {
      const errorMsg = 'appointmentId ou invoiceId requis';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (amount <= 0) {
      const errorMsg = 'Le montant doit être supérieur à 0';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Préparer les paramètres
      const params: CreatePaymentParams = {
        appointmentId,
        invoiceId,
        amount,
        currency,
        customerEmail: customerEmail || user?.email,
        customerPhone: customerPhone || user?.phone,
        customerName: customerName || user?.name,
      };

      // Créer le paiement via le backend
      const paymentData = await paymentService.createPayment(params);

      // Appeler le callback de succès
      onSuccess?.();

      // Rediriger vers la page de paiement KKIAPAY
      paymentService.redirectToPayment(paymentData.paymentUrl);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la création du paiement';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Erreur paiement KKIAPAY:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Styles par défaut si aucune classe n'est fournie
  const defaultClassName = `
    px-6 py-3 rounded-lg font-semibold text-white
    transition-all duration-200 transform
    hover:scale-105 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    shadow-lg hover:shadow-xl
    flex items-center justify-center gap-2
  `.trim().replace(/\s+/g, ' ');

  const buttonClasses = className || defaultClassName;

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={disabled || processing}
        className={buttonClasses}
        style={{
          backgroundColor: processing 
            ? 'var(--color-racine-400)' 
            : 'var(--color-racine-600)',
        }}
      >
        {processing ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
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
            <span>Création du paiement...</span>
          </>
        ) : (
          <>
            <span>💳</span>
            <span>{buttonText || `Payer ${amount.toLocaleString()} ${currency} avec KKIAPAY`}</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <strong>Erreur :</strong> {error}
        </div>
      )}
    </div>
  );
}

