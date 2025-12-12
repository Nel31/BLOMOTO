import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quote {
  _id: string;
  quoteNumber: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
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

export default function GarageQuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Formulaire de création
  const [formData, setFormData] = useState({
    clientId: '',
    appointmentId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as QuoteItem[],
    taxRate: 20,
    notes: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    loadQuotes();
    loadClients();
    loadAppointments();
  }, []);

  const loadQuotes = async () => {
    try {
      const res = await api.get("/quotes/garage/me");
      // Filtrer les devis en brouillon
      const quotesList = (res.data.quotes || []).filter((q: Quote) => q.status !== 'draft');
      setQuotes(quotesList);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      // Charger les clients depuis les rendez-vous
      const res = await api.get("/appointments/garage/me");
      const apts = res.data.appointments || [];
      const uniqueClients = Array.from(
        new Map(apts.map((apt: any) => [apt.clientId._id, apt.clientId])).values()
      );
      setClients(uniqueClients);
    } catch (err) {
      console.error("Erreur chargement clients:", err);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await api.get("/appointments/garage/me");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Erreur chargement rendez-vous:", err);
    }
  };

  const handleCreateQuote = async () => {
    try {
      const res = await api.post("/quotes", formData);
      setShowCreateModal(false);
      setFormData({
        clientId: '',
        appointmentId: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        taxRate: 20,
        notes: '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      loadQuotes();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la création");
    }
  };

  const handleSendQuote = async (sendViaChat: boolean, sendViaEmail: boolean) => {
    if (!selectedQuote) return;
    try {
      await api.post(`/quotes/${selectedQuote._id}/send`, {
        sendViaChat,
        sendViaEmail,
      });
      setShowSendModal(false);
      setSelectedQuote(null);
      loadQuotes();
      alert("Devis envoyé avec succès");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi");
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

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const updatedItem = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
    }
    newItems[index] = updatedItem;
    setFormData({ ...formData, items: newItems });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/garage')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
            title="Retour au dashboard"
          >
            <svg className="w-6 h-6" style={{ color: 'var(--color-noir-700)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-noir)' }}>Devis</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300"
          style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
        >
          + Nouveau devis
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: 'var(--color-racine-50)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                N° Devis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                Client
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
              return (
                <tr key={quote._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--color-noir)' }}>
                    {quote.quoteNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-noir-700)' }}>
                    {quote.clientId.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-noir-700)' }}>
                    {quote.total.toFixed(2)}€
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded-full"
                      style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                    >
                      {statusColor.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-noir-700)' }}>
                    {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {quote.pdfUrl && (
                        <a
                          href={quote.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          PDF
                        </a>
                      )}
                      {quote.status === 'accepted' && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.post(`/invoices/from-quote/${quote._id}`, {
                                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              });
                              alert("Facture créée avec succès !");
                              navigate('/garage/invoices');
                            } catch (err: any) {
                              alert(err.response?.data?.message || "Erreur lors de la création de la facture");
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                          title="Créer une facture depuis ce devis"
                        >
                          → Facture
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Nouveau devis</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
                  Client
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
                  Rendez-vous (optionnel)
                </label>
                <select
                  value={formData.appointmentId}
                  onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Aucun</option>
                  {appointments
                    .filter((apt) => apt.clientId._id === formData.clientId)
                    .map((apt) => (
                      <option key={apt._id} value={apt._id}>
                        {new Date(apt.date).toLocaleDateString('fr-FR')} - {apt.time}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Articles
                </label>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-4 py-2 border rounded-lg"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Prix unit."
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-32 px-4 py-2 border rounded-lg"
                      min="0"
                      step="0.01"
                    />
                    <span className="px-4 py-2" style={{ color: 'var(--color-noir-700)' }}>
                      {(item.quantity * item.unitPrice).toFixed(2)}€
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addItem}
                  className="mt-2 px-4 py-2 bg-gray-200 rounded-lg text-sm"
                >
                  + Ajouter un article
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
                    Taux de TVA (%)
                  </label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
                    Valide jusqu'au
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateQuote}
                className="px-6 py-2 rounded-lg font-semibold text-white"
                style={{ backgroundColor: 'var(--color-rouge-600)' }}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'envoi */}
      {showSendModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Envoyer le devis</h2>
            <p className="mb-4" style={{ color: 'var(--color-noir-700)' }}>
              Comment souhaitez-vous envoyer le devis {selectedQuote.quoteNumber} ?
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  id="sendChat"
                />
                <span style={{ color: 'var(--color-noir-700)' }}>Via le chat de l'application</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  id="sendEmail"
                />
                <span style={{ color: 'var(--color-noir-700)' }}>Par email</span>
              </label>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSelectedQuote(null);
                }}
                className="px-6 py-2 border rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const sendChat = (document.getElementById('sendChat') as HTMLInputElement)?.checked;
                  const sendEmail = (document.getElementById('sendEmail') as HTMLInputElement)?.checked;
                  handleSendQuote(sendChat, sendEmail);
                }}
                className="px-6 py-2 rounded-lg font-semibold text-white"
                style={{ backgroundColor: 'var(--color-rouge-600)' }}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

