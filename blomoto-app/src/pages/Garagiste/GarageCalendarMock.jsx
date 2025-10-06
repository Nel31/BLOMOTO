import React, { useEffect, useState } from 'react';
import { fetchAppointmentsByGarage } from '../../mocks/mockApi';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

function GarageCalendarMock({ garageId = 1 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAppointmentsByGarage(garageId);
        setAppointments(data);
      } catch (e) {
        setError('Erreur de chargement des rendez-vous.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [garageId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Calendrier (mock)</h2>
      {loading && <LoadingSkeleton rows={6} />}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map(a => (
            <div key={a.id} className="bg-white rounded-lg p-4 shadow">
              <div className="text-gray-900 font-medium">RDV #{a.id}</div>
              <div className="text-gray-600">{new Date(a.datetime).toLocaleString()}</div>
              <div className="mt-1 text-sm">Service: {a.service_id}</div>
              <div className="mt-1 text-sm">Client: {a.client_id}</div>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs ${a.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GarageCalendarMock;


