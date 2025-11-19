import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function GarageAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "today" | "pending" | "confirmed" | "completed">("all");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/appointments/garage/me");
      setAppointments(res.data.appointments || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
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

  const filterAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (activeTab) {
      case "today":
        return appointments.filter((apt) => {
          const aptDate = new Date(apt.date);
          return aptDate >= today && aptDate < tomorrow;
        });
      case "pending":
        return appointments.filter((apt) => apt.status === "pending");
      case "confirmed":
        return appointments.filter((apt) => apt.status === "confirmed");
      case "completed":
        return appointments.filter((apt) => apt.status === "completed");
      default:
        return appointments;
    }
  };

  const displayAppointments = filterAppointments();

  const today = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return aptDate >= todayDate && aptDate < tomorrow;
  }).length;

  const pending = appointments.filter((apt) => apt.status === "pending").length;
  const confirmed = appointments.filter((apt) => apt.status === "confirmed").length;
  const completed = appointments.filter((apt) => apt.status === "completed").length;

  return (
    <div className="min-h-screen animate-fadeIn" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate("/garage")}
              className="mb-4 flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: 'var(--color-noir-600)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
              Mes Rendez-vous
            </h1>
            <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>
              Gérez tous vos rendez-vous clients
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--color-racine-200)' }}>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
                activeTab === "all" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "all" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "all" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Tous ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab("today")}
              className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
                activeTab === "today" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "today" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "today" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Aujourd'hui ({today})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
                activeTab === "pending" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "pending" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "pending" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              En attente ({pending})
            </button>
            <button
              onClick={() => setActiveTab("confirmed")}
              className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
                activeTab === "confirmed" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "confirmed" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "confirmed" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Confirmés ({confirmed})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
                activeTab === "completed" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "completed" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "completed" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Terminés ({completed})
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
              </div>
            ) : displayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-noir-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-base mb-4" style={{ color: 'var(--color-noir-600)' }}>
                  Aucun rendez-vous {activeTab !== "all" ? `(${activeTab})` : ""}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayAppointments.map((apt) => {
                  const statusColors = getStatusColor(apt.status);
                  const aptDate = new Date(apt.date);
                  const canUpdate = apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'in-progress';

                  return (
                    <div
                      key={apt._id}
                      className="bg-white/50 rounded-xl p-5 sm:p-6 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
                      style={{ borderColor: 'var(--color-racine-200)' }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-lg font-bold" style={{ color: 'var(--color-noir)' }}>
                                  {aptDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {apt.time}
                                </span>
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                                >
                                  {statusColors.label}
                                </span>
                              </div>
                              <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: 'var(--color-noir)' }}>
                                👤 {apt.clientId?.name || 'Client'}
                              </h3>
                              <p className="text-sm mb-2" style={{ color: 'var(--color-noir-600)' }}>
                                📧 {apt.clientId?.email || '-'} | 📞 {apt.clientId?.phone || '-'}
                              </p>
                              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-noir-700)' }}>
                                🔧 {apt.serviceId?.name || 'Service'}
                              </p>
                              {apt.serviceId?.price && (
                                <p className="text-sm mb-2" style={{ color: 'var(--color-rouge-600)' }}>
                                  💰 {apt.serviceId.price}€
                                </p>
                              )}
                              {apt.notes && (
                                <p className="text-sm italic mb-2" style={{ color: 'var(--color-noir-600)' }}>
                                  📝 {apt.notes}
                                </p>
                              )}
                              {apt.vehicleInfo && (apt.vehicleInfo.brand || apt.vehicleInfo.model) && (
                                <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                                  🚗 {apt.vehicleInfo.brand} {apt.vehicleInfo.model} {apt.vehicleInfo.year ? `(${apt.vehicleInfo.year})` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        {canUpdate && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            {apt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateStatus(apt._id, 'confirmed')}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                                  style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                                >
                                  <span className="relative z-10">✓ Accepter</span>
                                </button>
                                <button
                                  onClick={() => updateStatus(apt._id, 'cancelled')}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                                  style={{ backgroundColor: 'var(--color-noir-600)', color: 'white' }}
                                >
                                  <span className="relative z-10">✗ Refuser</span>
                                </button>
                              </>
                            )}
                            {apt.status === 'confirmed' && (
                              <button
                                onClick={() => updateStatus(apt._id, 'in-progress')}
                                className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                                style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
                              >
                                <span className="relative z-10">▶ Démarrer</span>
                              </button>
                            )}
                            {apt.status === 'in-progress' && (
                              <button
                                onClick={() => updateStatus(apt._id, 'completed')}
                                className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                                style={{ backgroundColor: 'var(--color-racine-600)', color: 'white' }}
                              >
                                <span className="relative z-10">✓ Terminer</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

