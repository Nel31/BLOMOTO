import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth";
import FedapayButton from "../components/Payment/FedapayButton";

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quote {
  _id: string;
  quoteNumber: string;
  garageId: {
    _id: string;
    name: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
    };
    phone: string;
  };
  appointmentId?: {
    _id: string;
    date: string;
    time: string;
  };
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  notes?: string;
  validUntil: string;
  pdfUrl?: string;
  sentViaChat: boolean;
  sentViaEmail: boolean;
  createdAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  quoteId?: {
    _id: string;
    quoteNumber: string;
  };
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  paidAmount: number;
}

export default function ClientQuotesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'client') {
      navigate("/app", { replace: true });
      return;
    }
    loadQuotes();
  }, [user, navigate]);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const [quotesRes, invoicesRes] = await Promise.all([
        api.get("/quotes/client/me"),
        api.get("/invoices/client/me")
      ]);
      setQuotes(quotesRes.data.quotes || []);
      setInvoices(invoicesRes.data.invoices || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const acceptQuote = async (quoteId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir accepter ce devis ?")) {
      return;
    }

    setProcessing(quoteId);
    try {
      await api.put(`/quotes/${quoteId}/accept`);
      await loadQuotes();
      if (selectedQuote?._id === quoteId) {
        const updated = quotes.find(q => q._id === quoteId);
        if (updated) setSelectedQuote({ ...updated, status: 'accepted' });
      }
      alert("Devis accepté avec succès !");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'acceptation");
    } finally {
      setProcessing(null);
    }
  };

  const rejectQuote = async (quoteId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir rejeter ce devis ?")) {
      return;
    }

    setProcessing(quoteId);
    try {
      await api.put(`/quotes/${quoteId}/reject`);
      await loadQuotes();
      if (selectedQuote?._id === quoteId) {
        const updated = quotes.find(q => q._id === quoteId);
        if (updated) setSelectedQuote({ ...updated, status: 'rejected' });
      }
      alert("Devis rejeté");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors du rejet");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return { bg: 'var(--color-racine-100)', text: 'var(--color-racine-700)', label: 'Envoyé' };
      case 'accepted':
        return { bg: 'var(--color-racine-200)', text: 'var(--color-racine-800)', label: 'Accepté' };
      case 'rejected':
        return { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)', label: 'Refusé' };
      case 'expired':
        return { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)', label: 'Expiré' };
      default:
        return { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)', label: status };
    }
  };

  const openDetailModal = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };

  // Trouver la facture associée à un devis
  const getInvoiceForQuote = (quoteId: string): Invoice | null => {
    return invoices.find(inv => inv.quoteId?._id === quoteId || inv.quoteId === quoteId) || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-racine-50)] to-[var(--color-racine-100)] flex items-center justify-center">
        <div className="text-[var(--color-noir-700)] text-base sm:text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-racine-50)] via-white to-[var(--color-rose-50)]">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-noir)] bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] bg-clip-text text-transparent">
            Mes devis
          </h1>
          <button
            onClick={() => navigate("/app/appointments")}
            className="px-4 py-2 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            ← Retour aux rendez-vous
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {quotes.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md border border-[var(--color-racine-200)] text-center">
            <p className="text-[var(--color-noir-700)] text-lg">Aucun devis pour le moment</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-[var(--color-racine-200)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[var(--color-racine-50)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                      N° Devis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                      Garage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                      Valide jusqu'au
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((quote) => {
                    const statusColor = getStatusColor(quote.status);
                    const isExpired = new Date(quote.validUntil) < new Date();
                    return (
                      <tr key={quote._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--color-noir)' }}>
                          {quote.quoteNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-noir-700)' }}>
                          {quote.garageId.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: 'var(--color-rouge-600)' }}>
                          {quote.total.toLocaleString()} XOF
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="px-2 py-1 text-xs font-semibold rounded-full"
                            style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                          >
                            {statusColor.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: isExpired ? 'var(--color-rouge-600)' : 'var(--color-noir-700)' }}>
                          {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => openDetailModal(quote)}
                              className="text-[var(--color-racine-600)] hover:text-[var(--color-racine-700)] font-semibold"
                            >
                              Voir
                            </button>
                            {quote.status === 'sent' && !isExpired && (
                              <>
                                <button
                                  onClick={() => acceptQuote(quote._id)}
                                  disabled={processing === quote._id}
                                  className="text-[var(--color-racine-600)] hover:text-[var(--color-racine-700)] font-semibold disabled:opacity-50"
                                >
                                  {processing === quote._id ? 'Traitement...' : 'Accepter'}
                                </button>
                                <button
                                  onClick={() => rejectQuote(quote._id)}
                                  disabled={processing === quote._id}
                                  className="text-[var(--color-rouge-600)] hover:text-[var(--color-rouge-700)] font-semibold disabled:opacity-50"
                                >
                                  {processing === quote._id ? 'Traitement...' : 'Rejeter'}
                                </button>
                              </>
                            )}
                            {quote.status === 'accepted' && (() => {
                              const invoice = getInvoiceForQuote(quote._id);
                              const amount = invoice ? (invoice.total - (invoice.paidAmount || 0)) : quote.total;
                              if (invoice && invoice.status !== 'paid' && amount > 0) {
                                return (
                                  <div className="mt-1">
                                    <FedapayButton
                                      invoiceId={invoice._id}
                                      amount={amount}
                                      currency="XOF"
                                      onSuccess={() => {
                                        console.log('Paiement initié pour la facture:', invoice._id);
                                        setTimeout(() => {
                                          loadQuotes();
                                        }, 2000);
                                      }}
                                      buttonText={`💳 Payer ${amount.toLocaleString()} XOF`}
                                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-xl"
                                    />
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de détail */}
        {showDetailModal && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-noir)' }}>
                    Devis {selectedQuote.quoteNumber}
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Garage</p>
                    <p className="font-semibold" style={{ color: 'var(--color-noir)' }}>{selectedQuote.garageId.name}</p>
                    <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                      {selectedQuote.garageId.address.street}, {selectedQuote.garageId.address.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Statut</p>
                    <span
                      className="inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1"
                      style={{ backgroundColor: getStatusColor(selectedQuote.status).bg, color: getStatusColor(selectedQuote.status).text }}
                    >
                      {getStatusColor(selectedQuote.status).label}
                    </span>
                  </div>
                </div>

                {selectedQuote.appointmentId && (
                  <div className="mb-6 p-4 bg-[var(--color-racine-50)] rounded-lg">
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Rendez-vous associé</p>
                    <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                      {new Date(selectedQuote.appointmentId.date).toLocaleDateString('fr-FR')} à {selectedQuote.appointmentId.time}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-noir)' }}>Détails</h3>
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4" style={{ color: 'var(--color-noir-700)' }}>Description</th>
                        <th className="text-right py-2 px-4" style={{ color: 'var(--color-noir-700)' }}>Qté</th>
                        <th className="text-right py-2 px-4" style={{ color: 'var(--color-noir-700)' }}>Prix unit.</th>
                        <th className="text-right py-2 px-4" style={{ color: 'var(--color-noir-700)' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuote.items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-4" style={{ color: 'var(--color-noir)' }}>{item.description}</td>
                          <td className="text-right py-2 px-4" style={{ color: 'var(--color-noir)' }}>{item.quantity}</td>
                          <td className="text-right py-2 px-4" style={{ color: 'var(--color-noir)' }}>{item.unitPrice.toLocaleString()} XOF</td>
                          <td className="text-right py-2 px-4 font-semibold" style={{ color: 'var(--color-noir)' }}>{item.total.toLocaleString()} XOF</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span style={{ color: 'var(--color-noir-700)' }}>Sous-total</span>
                    <span className="font-semibold" style={{ color: 'var(--color-noir)' }}>{selectedQuote.subtotal.toLocaleString()} XOF</span>
                  </div>
                  {selectedQuote.taxRate > 0 && (
                    <div className="flex justify-between mb-2">
                    <span style={{ color: 'var(--color-noir-700)' }}>TVA ({selectedQuote.taxRate}%)</span>
                    <span className="font-semibold" style={{ color: 'var(--color-noir)' }}>{selectedQuote.tax.toLocaleString()} XOF</span>
                  </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span style={{ color: 'var(--color-noir)' }}>Total</span>
                    <span style={{ color: 'var(--color-rouge-600)' }}>{selectedQuote.total.toLocaleString()} XOF</span>
                  </div>
                </div>

                {selectedQuote.notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Notes</p>
                    <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>{selectedQuote.notes}</p>
                  </div>
                )}

                <div className="mt-6 flex gap-3 flex-wrap">
                  {selectedQuote.pdfUrl && (
                    <a
                      href={selectedQuote.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[var(--color-racine-600)] hover:bg-[var(--color-racine-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Télécharger PDF
                    </a>
                  )}
                  {selectedQuote.status === 'sent' && new Date(selectedQuote.validUntil) >= new Date() && (
                    <>
                      <button
                        onClick={() => {
                          acceptQuote(selectedQuote._id);
                          setShowDetailModal(false);
                        }}
                        disabled={processing === selectedQuote._id}
                        className="px-4 py-2 bg-[var(--color-racine-600)] hover:bg-[var(--color-racine-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      >
                        {processing === selectedQuote._id ? 'Traitement...' : 'Accepter le devis'}
                      </button>
                      <button
                        onClick={() => {
                          rejectQuote(selectedQuote._id);
                          setShowDetailModal(false);
                        }}
                        disabled={processing === selectedQuote._id}
                        className="px-4 py-2 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      >
                        {processing === selectedQuote._id ? 'Traitement...' : 'Rejeter le devis'}
                      </button>
                    </>
                  )}
                  {selectedQuote.status === 'accepted' && (() => {
                    const invoice = getInvoiceForQuote(selectedQuote._id);
                    const amount = invoice ? (invoice.total - (invoice.paidAmount || 0)) : selectedQuote.total;
                    if (invoice && invoice.status !== 'paid' && amount > 0) {
                      return (
                        <FedapayButton
                          invoiceId={invoice._id}
                          amount={amount}
                          currency="XOF"
                          onSuccess={() => {
                            console.log('Paiement initié pour la facture:', invoice._id);
                            setTimeout(() => {
                              loadQuotes();
                              setShowDetailModal(false);
                            }, 2000);
                          }}
                          buttonText={`💳 Payer ${amount.toLocaleString()} XOF`}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        />
                      );
                    }
                    if (invoice && invoice.status === 'paid') {
                      return (
                        <span className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg">
                          ✅ Facture payée
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

