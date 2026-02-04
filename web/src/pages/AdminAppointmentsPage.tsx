import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [garages, setGarages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    garageId: "",
    clientId: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    loadGarages();
    loadAppointments();
  }, []);

  const loadGarages = async () => {
    try {
      const res = await api.get("/garages");
      setGarages(res.data.garages || []);
    } catch (err: any) {
      console.error("Erreur lors du chargement des garages:", err);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.garageId) params.garageId = filters.garageId;
      if (filters.clientId) params.clientId = filters.clientId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const res = await api.get("/admin/appointments", { params });
      setAppointments(res.data.appointments || []);
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
    loadAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'var(--color-racine-100)', text: 'var(--color-racine-700)', label: 'En attente' };
      case 'confirmed':
        return { bg: 'var(--color-rouge-100)', text: 'var(--color-rouge-700)', label: 'Confirmé' };
      case 'in-progress':
        return { bg: 'var(--color-rose-100)', text: 'var(--color-rose-700)', label: 'En cours' };
      case 'completed':
        return { bg: 'var(--color-racine-200)', text: 'var(--color-racine-800)', label: 'Terminé' };
      case 'cancelled':
        return { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)', label: 'Annulé' };
      default:
        return { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)', label: status };
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
        Gestion des Rendez-vous
      </h1>

      {/* Filtres */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Filtres</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
              Garage
            </label>
            <select
              value={filters.garageId}
              onChange={(e) => handleFilterChange('garageId', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
            >
              <option value="">Tous les garages</option>
              {garages.map((garage) => (
                <option key={garage._id} value={garage._id}>
                  {garage.name} - {garage.address?.city || ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
              Date début
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
              Date fin
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2 flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
            >
              <span className="relative z-10">Appliquer les filtres</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Liste des rendez-vous */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-12 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>Aucun rendez-vous trouvé</p>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border overflow-hidden animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-racine-50)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Date & Heure</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Garage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-racine-200)' }}>
                {appointments.map((apt, index) => {
                  const statusColors = getStatusColor(apt.status);
                  const date = new Date(apt.date);
                  return (
                    <tr key={apt._id} className="hover:bg-opacity-50 hover:shadow-md transition-all duration-200" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-racine-50)' }}>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-700)' }}>
                        {date.toLocaleDateString('fr-FR')} à {apt.time}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                        {apt.clientId?.name || '-'}
                        <br />
                        <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                          {apt.clientId?.email || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                        {apt.garageId?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                        {apt.serviceId?.name || '-'}
                        {apt.serviceId?.price && (
                          <span className="block text-xs" style={{ color: 'var(--color-rouge-600)' }}>
                            {(apt.serviceId.price || 0).toLocaleString()} XOF
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                        >
                          {statusColors.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

