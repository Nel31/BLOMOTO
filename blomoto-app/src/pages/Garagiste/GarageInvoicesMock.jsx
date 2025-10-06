import React, { useEffect, useMemo, useState } from 'react';
import { fetchInvoicesByGarage } from '../../mocks/mockApi';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SimpleTable from '../../components/common/SimpleTable';

function GarageInvoicesMock({ garageId = 1 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchInvoicesByGarage(garageId, { status });
      setRows(data);
    } catch (e) {
      setError("Erreur de chargement des factures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [status]);

  const total = useMemo(() => rows.reduce((s, r) => s + Number(r.total_amount || 0), 0), [rows]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Factures (mock)</h2>
        <div className="text-gray-700">Total: <span className="font-semibold">{total} FCFA</span></div>
      </div>
      <div className="mb-4">
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Tous statuts</option>
          <option value="paid">Payée</option>
          <option value="pending">En attente</option>
        </select>
      </div>
      {loading && <LoadingSkeleton rows={5} />}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <SimpleTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'created_at', label: 'Date' },
            { key: 'status', label: 'Statut' },
            { key: 'total_amount', label: 'Montant' },
            { key: 'items', label: 'Détails', render: (v) => (Array.isArray(v) ? v.map(it => `${it.name} (${it.quantity}x)`).join(', ') : '—') },
          ]}
          data={rows}
        />
      )}
    </div>
  );
}

export default GarageInvoicesMock;


