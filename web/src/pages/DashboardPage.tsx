import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setData(res.data.stats);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const verifyGarage = async (id: string) => {
    try {
      await api.put(`/admin/garages/${id}/verify`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erreur: {error}
      </div>
    );
  }

  if (!data) return null;

  const statsCards = [
    {
      title: "Total Utilisateurs",
      value: data.users.total,
      icon: "👥",
      color: "rouge",
      subtitle: `${data.users.clients} clients, ${data.users.garagistes} garagistes`,
      growth: data.users.growth,
    },
    {
      title: "Garages",
      value: data.garages.total,
      icon: "🏢",
      color: "rose",
      subtitle: `${data.garages.active} actifs, ${data.garages.verified} vérifiés`,
      growth: data.garages.growth,
    },
    {
      title: "Rendez-vous",
      value: data.appointments.total,
      icon: "📅",
      color: "racine",
      subtitle: `${data.appointments.byStatus.pending} en attente`,
      growth: data.appointments.growth,
    },
    {
      title: "Avis",
      value: data.reviews.total,
      icon: "⭐",
      color: "rouge",
      subtitle: `Note moyenne: ${data.reviews.averageRating.toFixed(1)}/5`,
      growth: data.reviews.growth,
    },
  ];

  const renderGrowth = (growth: any) => {
    if (!growth) return null;
    return (
      <div className="flex items-center gap-2 text-xs mt-1">
        <span className="text-green-600">+{growth.today} aujourd'hui</span>
        <span style={{ color: 'var(--color-noir-400)' }}>•</span>
        <span style={{ color: 'var(--color-noir-500)' }}>+{growth.last7Days} cette semaine</span>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
        Dashboard
      </h1>
      
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white/90 backdrop-blur-md rounded-xl p-5 sm:p-6 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
            style={{ borderColor: `var(--color-${stat.color}-200)` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">{stat.icon}</div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: `var(--color-${stat.color}-100)`, color: `var(--color-${stat.color}-600)` }}
              >
                {stat.value}
              </div>
            </div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-noir-700)' }}>
              {stat.title}
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
              {stat.subtitle}
            </p>
            {renderGrowth(stat.growth)}
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/admin/appointments"
          className="bg-white/90 backdrop-blur-md rounded-xl p-5 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn cursor-pointer"
          style={{ borderColor: 'var(--color-racine-200)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-rouge-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-rouge-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-noir)' }}>Rendez-vous</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
            {data.appointments.byStatus.pending} en attente
          </p>
        </Link>

        <Link
          to="/admin/reviews"
          className="bg-white/90 backdrop-blur-md rounded-xl p-5 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn cursor-pointer"
          style={{ borderColor: 'var(--color-racine-200)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-rose-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-rose-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-noir)' }}>Avis</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
            {data.reviews.total} avis au total
          </p>
        </Link>

        <Link
          to="/admin/services"
          className="bg-white/90 backdrop-blur-md rounded-xl p-5 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn cursor-pointer"
          style={{ borderColor: 'var(--color-racine-200)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-racine-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-racine-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-noir)' }}>Services</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
            {data.services.active} actifs
          </p>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-white/90 backdrop-blur-md rounded-xl p-5 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn cursor-pointer"
          style={{ borderColor: 'var(--color-racine-200)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-rose-100)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--color-rose-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-noir)' }}>Analytics</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
            Rapports détaillés
          </p>
        </Link>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Répartition Utilisateurs */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Répartition Utilisateurs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Clients</span>
              <span className="font-semibold" style={{ color: 'var(--color-rouge-600)' }}>{data.users.clients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Garagistes</span>
              <span className="font-semibold" style={{ color: 'var(--color-rose-600)' }}>{data.users.garagistes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Admins</span>
              <span className="font-semibold" style={{ color: 'var(--color-racine-600)' }}>{data.users.admins}</span>
            </div>
          </div>
        </div>

        {/* Statistiques Garages */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Statistiques Garages</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Total</span>
              <span className="font-semibold" style={{ color: 'var(--color-noir)' }}>{data.garages.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Actifs</span>
              <span className="font-semibold" style={{ color: 'var(--color-rouge-600)' }}>{data.garages.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Vérifiés</span>
              <span className="font-semibold" style={{ color: 'var(--color-rose-600)' }}>{data.garages.verified}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>Non vérifiés</span>
              <span className="font-semibold" style={{ color: 'var(--color-noir-400)' }}>{data.garages.unverified}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Rendez-vous récents */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-noir)' }}>Rendez-vous récents</h3>
            <Link to="/admin/appointments" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-rouge-600)' }}>
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.recent.appointments && data.recent.appointments.length > 0 ? (
              data.recent.appointments.slice(0, 5).map((apt: any) => {
                const date = new Date(apt.date);
                const statusColors: any = {
                  pending: { bg: 'var(--color-racine-100)', text: 'var(--color-racine-700)' },
                  confirmed: { bg: 'var(--color-rouge-100)', text: 'var(--color-rouge-700)' },
                  completed: { bg: 'var(--color-racine-200)', text: 'var(--color-racine-800)' },
                  cancelled: { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)' },
                };
                const colors = statusColors[apt.status] || statusColors.pending;
                return (
                  <div key={apt._id} className="flex items-center justify-between text-sm p-2 rounded" style={{ backgroundColor: 'var(--color-racine-50)' }}>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: 'var(--color-noir-700)' }}>
                        {apt.clientId?.name || 'Client'} → {apt.garageId?.name || 'Garage'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
                        {date.toLocaleDateString('fr-FR')} à {apt.time}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {apt.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-noir-500)' }}>Aucun rendez-vous récent</p>
            )}
          </div>
        </div>

        {/* Avis récents */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-noir)' }}>Avis récents</h3>
            <Link to="/admin/reviews" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-rouge-600)' }}>
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.recent.reviews && data.recent.reviews.length > 0 ? (
              data.recent.reviews.slice(0, 5).map((review: any) => (
                <div key={review._id} className="flex items-start gap-3 p-2 rounded" style={{ backgroundColor: 'var(--color-racine-50)' }}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {review.clientId?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>
                      {review.clientId?.name || 'Client'} • {review.garageId?.name || 'Garage'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < review.rating ? '' : 'opacity-30'}`} style={{ color: i < review.rating ? 'var(--color-rose-500)' : 'var(--color-noir-300)' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-noir-600)' }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-noir-500)' }}>Aucun avis récent</p>
            )}
          </div>
        </div>
      </div>

      {/* Top garages */}
      {data.topGarages && data.topGarages.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>⭐ Top Garages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.topGarages.slice(0, 5).map((garage: any) => (
              <div key={garage._id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-racine-200)', backgroundColor: 'var(--color-racine-50)' }}>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-noir)' }}>{garage.name}</p>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--color-rose-600)' }}>
                    {garage.rating?.average?.toFixed(1) || '0.0'}
                  </span>
                  <svg className="w-3 h-3" style={{ color: 'var(--color-rose-500)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                    ({garage.rating?.count || 0})
                  </span>
                </div>
                {garage.isVerified && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                    ✓ Vérifié
                  </span>
                )}
                {!garage.isVerified && (
                  <button
                    onClick={() => verifyGarage(garage._id)}
                    className="text-xs px-2 py-0.5 rounded-full font-semibold hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--color-racine-600)', color: 'white' }}
                  >
                    Vérifier
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
