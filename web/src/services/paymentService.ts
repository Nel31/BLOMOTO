import { api } from '../api/client';

/**
 * Interface pour les paramètres de création de paiement
 */
export interface CreatePaymentParams {
  appointmentId?: string;
  invoiceId?: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

/**
 * Interface pour la réponse de création de paiement
 */
export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl: string;
  publicKey?: string;
  [key: string]: any;
}

/**
 * Interface pour le statut d'une transaction
 */
export interface PaymentStatus {
  success: boolean;
  status: string;
  transaction: any;
}

/**
 * Service de paiement FedaPay
 * 
 * Ce service gère toutes les interactions avec l'API de paiement FedaPay
 * via le backend. Le frontend ne gère jamais les clés secrètes.
 */
class PaymentService {
  /**
   * Créer un paiement FedaPay
   * 
   * @param params - Paramètres du paiement (appointmentId ou invoiceId, amount, etc.)
   * @returns Promise avec les données de la transaction (transactionId, paymentUrl)
   * @throws Error si la création échoue
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    try {
      const response = await api.post<PaymentResponse>('/payments/fedapay/create', {
        appointmentId: params.appointmentId,
        invoiceId: params.invoiceId,
        amount: params.amount,
        currency: params.currency || 'XOF',
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        customerName: params.customerName,
      });

      if (!response.data.success || !response.data.paymentUrl) {
        throw new Error('Réponse invalide du serveur');
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erreur lors de la création du paiement';
      throw new Error(errorMessage);
    }
  }

  /**
   * Vérifier le statut d'une transaction FedaPay
   * 
   * @param transactionId - ID de la transaction à vérifier
   * @returns Promise avec le statut de la transaction
   * @throws Error si la vérification échoue
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await api.get<PaymentStatus>(`/payments/fedapay/status/${transactionId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erreur lors de la vérification du statut';
      throw new Error(errorMessage);
    }
  }

  /**
   * Rediriger l'utilisateur vers la page de paiement FedaPay
   * 
   * @param paymentUrl - URL de paiement retournée par l'API
   */
  redirectToPayment(paymentUrl: string): void {
    if (!paymentUrl) {
      throw new Error('URL de paiement invalide');
    }
    window.location.href = paymentUrl;
  }
}

// Export d'une instance unique (singleton)
export const paymentService = new PaymentService();

// Export par défaut pour compatibilité
export default paymentService;

