import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../api/client";
import { useNotifications } from "../hooks/useNotifications";

interface Stats {
  garage: {
    id: string;
    name: string;
    rating: {
      average: number;
      count: number;
    };
    isVerified: boolean;
    isActive: boolean;
  };
  appointments: {
    total: number;
    today: number;
    thisMonth: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  services: {
    total: number;
    active: number;
  };
  reviews: {
    total: number;
    recent: any[];
  };
}

export default function GarageDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [garageDetails, setGarageDetails] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger les statistiques
      const statsRes = await api.get("/garages/me/stats");
      setStats(statsRes.data.stats);

      // Charger les détails complets du garage
      try {
        const garageRes = await api.get("/garages/me");
        setGarageDetails(garageRes.data.garage);
      } catch (err) {
        console.error("Erreur chargement détails garage:", err);
      }

      // Charger les conversations
      try {
        const messagesRes = await api.get("/messages/conversations");
        setConversations(messagesRes.data.conversations || []);
      } catch (err) {
        console.error("Erreur chargement conversations:", err);
      }

      // Charger les rendez-vous du jour
      const appointmentsRes = await api.get("/appointments/garage/me");
      const allAppointments = appointmentsRes.data.appointments || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayApts = allAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.date);
        return aptDate >= today && aptDate < tomorrow;
      }).sort((a: any, b: any) => {
        const timeA = a.time || "00:00";
        const timeB = b.time || "00:00";
        return timeA.localeCompare(timeB);
      });

      setTodayAppointments(todayApts);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/app", { replace: true });
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status });
      loadDashboardData();
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

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4" style={{ color: 'var(--color-rose-500)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4" style={{ color: 'var(--color-rose-500)' }} fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4" style={{ color: 'var(--color-noir-300)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen animate-fadeIn flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen animate-fadeIn flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erreur: {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen animate-fadeIn" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
              Dashboard Garagiste
            </h1>
            <p className="text-base sm:text-lg" style={{ color: 'var(--color-noir-600)' }}>
              Bienvenue, <span className="font-semibold text-[var(--color-rouge-600)]">{user?.name}</span>
            </p>
            {stats.garage && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-noir-700)' }}>
                  {stats.garage.name}
                </span>
                {stats.garage.isVerified && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                    ✓ Vérifié
                  </span>
                )}
                {renderStars(stats.garage.rating.average)}
                <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                  ({stats.garage.rating.count} avis)
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Badge de notifications */}
            <Link
              to="/garage/messages"
              className="relative p-2 rounded-lg hover:bg-[var(--color-racine-100)] transition-all duration-300"
              title={`${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--color-noir-700)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 00-2-2H9a2 2 0 00-2 2v.341C4.67 6.165 3 8.388 3 11v3.159c0 .538-.214 1.055-.595 1.436L1 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white"
                  style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-sm sm:text-base hover:scale-105 active:scale-95 relative overflow-hidden"
            >
              <span className="relative z-10">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-rouge-200)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-rouge-600)' }}>
              {stats.appointments.today}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
              Rendez-vous aujourd'hui
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-rose-200)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-rose-600)' }}>
              {stats.appointments.pending}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
              En attente
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-racine-600)' }}>
              {stats.services.active}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
              Services actifs
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-rose-200)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-rose-600)' }}>
              {stats.garage.rating.average.toFixed(1)}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
              Note moyenne
            </div>
          </div>
        </div>

        {/* Rendez-vous du jour */}
        {todayAppointments.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'var(--color-racine-200)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-noir)' }}>
                📅 Rendez-vous d'aujourd'hui ({todayAppointments.length})
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {todayAppointments.map((apt) => {
                const statusColors = getStatusColor(apt.status);
                const aptDate = new Date(apt.date);
                const canUpdate = apt.status === 'pending' || apt.status === 'confirmed';

                return (
                  <div
                    key={apt._id}
                    className="bg-white/50 rounded-lg p-4 border hover:shadow-md transition-all duration-200"
                    style={{ borderColor: 'var(--color-racine-200)' }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold" style={{ color: 'var(--color-noir)' }}>
                            {apt.time}
                          </span>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                          >
                            {statusColors.label}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>
                            👤 {apt.clientId?.name || 'Client'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
                            🔧 {apt.serviceId?.name || 'Service'}
                          </p>
                          {apt.notes && (
                            <p className="text-xs italic" style={{ color: 'var(--color-noir-500)' }}>
                              {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      {canUpdate && (
                        <div className="flex gap-2">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                                style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                              >
                                <span className="relative z-10">✓ Accepter</span>
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                                style={{ backgroundColor: 'var(--color-noir-600)', color: 'white' }}
                              >
                                <span className="relative z-10">✗ Refuser</span>
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt._id, 'in-progress')}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                              style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
                            >
                              <span className="relative z-10">▶ Démarrer</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            to="/garage/appointments"
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fadeIn"
            style={{ borderColor: 'var(--color-racine-200)' }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'var(--color-rouge-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-rouge-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>Mes Rendez-vous</h3>
            <p className="text-sm sm:text-base mb-3" style={{ color: 'var(--color-noir-600)' }}>Gérez tous vos rendez-vous ({stats.appointments.total} total)</p>
            <div className="text-xs font-semibold" style={{ color: 'var(--color-rouge-600)' }}>
              Voir tout →
            </div>
          </Link>

          <Link
            to="/garage/services"
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fadeIn"
            style={{ borderColor: 'var(--color-racine-200)' }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'var(--color-rose-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-rose-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>Mes Services</h3>
            <p className="text-sm sm:text-base mb-3" style={{ color: 'var(--color-noir-600)' }}>Gérez vos services proposés ({stats.services.active} actifs)</p>
            <div className="text-xs font-semibold" style={{ color: 'var(--color-rose-600)' }}>
              Gérer →
            </div>
          </Link>

          <Link
            to="/garage/reviews"
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fadeIn"
            style={{ borderColor: 'var(--color-racine-200)' }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'var(--color-racine-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-racine-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>Avis Clients</h3>
            <p className="text-sm sm:text-base mb-3" style={{ color: 'var(--color-noir-600)' }}>Consultez les avis reçus ({stats.reviews.total} total)</p>
            <div className="text-xs font-semibold" style={{ color: 'var(--color-racine-600)' }}>
              Voir tout →
            </div>
          </Link>

          <Link
            to="/garage/messages"
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fadeIn"
            style={{ borderColor: 'var(--color-racine-200)' }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'var(--color-rouge-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-rouge-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>Messages</h3>
            <p className="text-sm sm:text-base mb-3" style={{ color: 'var(--color-noir-600)' }}>Discutez avec vos clients ({conversations.length} conversations)</p>
            <div className="text-xs font-semibold" style={{ color: 'var(--color-rouge-600)' }}>
              Voir tout →
            </div>
          </Link>
        </div>

        {/* Messages récents */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="p-4 sm:p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-racine-200)' }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-noir)' }}>
              💬 Messages Clients
            </h2>
            <Link
              to="/garage/messages"
              className="text-sm font-semibold hover:underline"
              style={{ color: 'var(--color-rouge-600)' }}
            >
              Voir tout →
            </Link>
          </div>
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Aucune conversation</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-3">
              {conversations.slice(0, 3).map((conv) => (
                <Link
                  key={conv._id}
                  to={`/garage/messages?userId=${conv.user._id}`}
                  className="block p-3 bg-white/50 rounded-lg border hover:shadow-md transition-all duration-200"
                  style={{ borderColor: 'var(--color-racine-200)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {conv.user.avatar ? (
                        <img src={conv.user.avatar} alt={conv.user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--color-rouge-100)', color: 'var(--color-rouge-700)' }}>
                          {conv.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>{conv.user.name}</p>
                        <p className="text-xs truncate max-w-[200px]" style={{ color: 'var(--color-noir-600)' }}>
                          {conv.lastMessage?.content || 'Aucun message'}
                        </p>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Informations complètes du garage */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border p-4 sm:p-6 animate-fadeIn mb-6" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
                Informations complètes du garage
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                Toutes les informations de votre garage (publiques et privées)
              </p>
            </div>
            <Link
              to="/garage/settings"
              className="px-4 py-2 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-sm hover:scale-105 active:scale-95 relative overflow-hidden"
            >
              <span className="relative z-10">⚙️ Modifier</span>
            </Link>
          </div>
          
          {garageDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Informations générales</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: 'var(--color-noir-600)' }}>Nom:</span>
                    <span className="ml-2" style={{ color: 'var(--color-noir)' }}>{garageDetails.name}</span>
                  </div>
                  {garageDetails.description && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-noir-600)' }}>Description:</span>
                      <p className="ml-2 mt-1" style={{ color: 'var(--color-noir)' }}>{garageDetails.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium" style={{ color: 'var(--color-noir-600)' }}>Statut:</span>
                    <span className="ml-2">
                      {garageDetails.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rouge-100)', color: 'var(--color-rouge-700)' }}>
                          Actif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-noir-200)', color: 'var(--color-noir-600)' }}>
                          Suspendu
                        </span>
                      )}
                      {garageDetails.isVerified && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-100)', color: 'var(--color-rose-700)' }}>
                          ✓ Vérifié
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Coordonnées</h3>
                <div className="space-y-2 text-sm">
                  {garageDetails.address && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-noir-600)' }}>Adresse:</span>
                      <p className="ml-2 mt-1" style={{ color: 'var(--color-noir)' }}>
                        {garageDetails.address.street}<br />
                        {garageDetails.address.postalCode} {garageDetails.address.city}
                      </p>
                    </div>
                  )}
                  {garageDetails.phone && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-noir-600)' }}>Téléphone:</span>
                      <span className="ml-2" style={{ color: 'var(--color-noir)' }}>{garageDetails.phone}</span>
                    </div>
                  )}
                  {garageDetails.email && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-noir-600)' }}>Email:</span>
                      <span className="ml-2" style={{ color: 'var(--color-noir)' }}>{garageDetails.email}</span>
                    </div>
                  )}
                  {garageDetails.website && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--color-noir-600)' }}>Site web:</span>
                      <a href={garageDetails.website} target="_blank" rel="noopener noreferrer" className="ml-2 hover:underline" style={{ color: 'var(--color-rouge-600)' }}>
                        {garageDetails.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {garageDetails.images && garageDetails.images.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Images ({garageDetails.images.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {garageDetails.images.slice(0, 4).map((img: string, idx: number) => (
                      <img key={idx} src={img} alt={`Garage ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border" style={{ borderColor: 'var(--color-racine-200)' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
