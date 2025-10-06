import React, { useEffect, useState } from 'react';
import { mockAdminOverview } from '../../mocks/mockApi';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import StatsCards from '../../components/common/StatsCards';
import SimpleTable from '../../components/common/SimpleTable';

function AdminOverviewMock() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpis, setKpis] = useState({});
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await mockAdminOverview();
        setKpis(res.kpis);
        setRows(res.garages);
      } catch (e) {
        setError("Erreur lors du chargement de la vue admin.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vue d'ensemble (mock)</h1>
      {loading && <LoadingSkeleton rows={4} />}
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {!loading && !error && (
        <>
          <StatsCards
            items={[
              { label: 'Garages', value: kpis.garages },
              { label: 'Note moyenne', value: kpis.avgRating },
              { label: 'Services', value: kpis.services },
              { label: 'RDV (semaine) - mock', value: rows.reduce((s, r) => s + (r.appointmentsThisWeek || 0), 0) }
            ]}
          />
          <div className="mt-6">
            <SimpleTable
              columns={[
                { key: 'name', label: 'Garage' },
                { key: 'city', label: 'Ville' },
                { key: 'avg_rating', label: 'Note' },
                { key: 'services_count', label: 'Services' },
                { key: 'appointmentsThisWeek', label: 'RDV (semaine)' },
                { key: 'totalRevenue', label: 'CA estimé' }
              ]}
              data={rows}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default AdminOverviewMock;


