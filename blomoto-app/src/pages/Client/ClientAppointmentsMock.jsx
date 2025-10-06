import React, { useEffect, useMemo, useState } from 'react';
import { fetchGarages, fetchServicesByGarage } from '../../mocks/mockApi';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

function ClientAppointmentsMock() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [garages, setGarages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const g = await fetchGarages();
      setGarages(g);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedGarage) return;
      setLoading(true);
      const s = await fetchServicesByGarage(selectedGarage.id);
      setServices(s);
      setLoading(false);
    };
    run();
  }, [selectedGarage]);

  const timeSlots = useMemo(() => (
    ['09:00', '10:00', '11:00', '14:00', '15:30', '16:30']
  ), []);

  const canConfirm = selectedGarage && selectedService && selectedSlot;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Réserver un rendez-vous (mock)</h2>
      {loading && <LoadingSkeleton rows={5} />}
      {!loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-semibold mb-2">Étape 1 — Choisir un garage</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {garages.map(g => (
                <button
                  key={g.id}
                  onClick={() => { setSelectedGarage(g); setStep(2); }}
                  className={`p-3 border rounded text-left hover:bg-gray-50 ${selectedGarage?.id === g.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="font-medium">{g.name}</div>
                  <div className="text-sm text-gray-600">{g.city} — {g.address}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-semibold mb-2">Étape 2 — Choisir un service</div>
            {selectedGarage ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep(3); }}
                    className={`p-3 border rounded text-left hover:bg-gray-50 ${selectedService?.id === s.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-600">{s.price} FCFA — {s.duration_min} min</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Choisissez d'abord un garage.</div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-semibold mb-2">Étape 3 — Choisir un créneau</div>
            {selectedService ? (
              <div className="flex flex-wrap gap-2">
                {timeSlots.map(t => (
                  <button
                    key={t}
                    onClick={() => { setSelectedSlot(t); setStep(4); }}
                    className={`px-3 py-2 border rounded ${selectedSlot === t ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Choisissez d'abord un service.</div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-semibold mb-2">Étape 4 — Confirmation</div>
            {canConfirm ? (
              <div className="space-y-1 text-gray-700">
                <div>Garage: <span className="font-medium">{selectedGarage.name}</span></div>
                <div>Service: <span className="font-medium">{selectedService.name}</span></div>
                <div>Créneau: <span className="font-medium">{selectedSlot}</span></div>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">Confirmer (mock)</button>
              </div>
            ) : (
              <div className="text-gray-500">Complétez les étapes précédentes.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientAppointmentsMock;


