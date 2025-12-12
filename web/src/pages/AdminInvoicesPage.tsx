import { useEffect, useState } from "react";
import { api } from "../api/client";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  garageId: {
    _id: string;
    name: string;
    address?: {
      street: string;
      city: string;
    };
  };
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
  quoteId?: {
    _id: string;
    quoteNumber: string;
  };
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  paidAmount: number;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  pdfUrl?: string;
  sentViaChat: boolean;
  sentViaEmail: boolean;
  createdAt: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [garages, setGarages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    garageId: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    loadGarages();
    loadInvoices();
  }, []);

  const loadGarages = async () => {
    try {
      const res = await api.get("/garages");
      setGarages(res.data.garages || []);
    } catch (err: any) {
      console.error("Erreur lors du chargement des garages:", err);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.garageId) params.garageId = filters.garageId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const res = await api.get("/admin/invoices", { params });
      // Filtrer les factures en brouillon
      const invoicesList = (res.data.invoices || []).filter((inv: Invoice) => inv.status !== 'draft');
      setInvoices(invoicesList);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadInvoices();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return { bg: 'var(--color-racine-100)', text: 'var(--color-racine-700)', label: 'Envoyée' };
      case 'paid':
        return { bg: 'var(--color-racine-200)', text: 'var(--color-racine-800)', label: 'Payée' };
      case 'overdue':
        return { bg: 'var(--color-rouge-200)', text: 'var(--color-rouge-800)', label: 'En retard' };
      case 'cancelled':
        return { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)', label: 'Annulée' };
      default:
        return { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)', label: status };
    }
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
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>Toutes les factures</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
              Garage
            </label>
            <select
              value={filters.garageId}
              onChange={(e) => handleFilterChange('garageId', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Tous les garages</option>
              {garages.map((garage) => (
                <option key={garage._id} value={garage._id}>
                  {garage.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
              Date de début
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
              Date de fin
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={applyFilters}
            className="px-6 py-2 rounded-lg font-semibold text-white"
            style={{ backgroundColor: 'var(--color-rouge-600)' }}
          >
            Appliquer les filtres
          </button>
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: 'var(--color-racine-50)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                N° Facture
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                Garage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                Payé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-noir-700)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => {
              const statusColor = getStatusColor(invoice.status);
              const remaining = invoice.total - invoice.paidAmount;
              return (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--color-noir)' }}>
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-noir-700)' }}>
                    {invoice.garageId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-noir-700)' }}>
                    {invoice.clientId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-noir-700)' }}>
                    {invoice.total.toFixed(2)}€
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-noir-700)' }}>
                    {invoice.paidAmount > 0 ? `${invoice.paidAmount.toFixed(2)}€` : '-'}
                    {remaining > 0 && (
                      <span className="text-xs text-red-600 ml-1">(Reste: {remaining.toFixed(2)}€)</span>
                    )}
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
                    {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          PDF
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Aucune facture trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

