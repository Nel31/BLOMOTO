import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/analytics");
      setAnalytics(res.data.analytics);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // Graphique simple (barres) pour les statistiques quotidiennes
  const renderDailyChart = (data: any[], field: string, label: string, color: string) => {
    const max = Math.max(...data.map(d => d[field]), 1);
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-noir)' }}>{label}</h4>
        <div className="flex items-end gap-1 h-32">
          {data.slice(-7).map((day, i) => {
            const height = (day[field] / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${height}%`,
                    backgroundColor: color,
                    minHeight: day[field] > 0 ? '2px' : '0',
                  }}
                  title={`${day.date}: ${day[field]}`}
                />
                <span className="text-xs mt-1 rotate-45 origin-left whitespace-nowrap" style={{ color: 'var(--color-noir-500)' }}>
                  {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
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

  if (!analytics) return null;

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
        Analytics & Rapports
      </h1>

      {/* Graphiques quotidiens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          {renderDailyChart(analytics.dailyStats || [], 'users', 'Nouveaux Utilisateurs (7 derniers jours)', 'var(--color-rouge-600)')}
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          {renderDailyChart(analytics.dailyStats || [], 'garages', 'Nouveaux Garages (7 derniers jours)', 'var(--color-rose-600)')}
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          {renderDailyChart(analytics.dailyStats || [], 'appointments', 'Rendez-vous (7 derniers jours)', 'var(--color-racine-600)')}
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          {renderDailyChart(analytics.dailyStats || [], 'reviews', 'Avis (7 derniers jours)', 'var(--color-rose-600)')}
        </div>
      </div>

      {/* Top garages par rendez-vous */}
      {analytics.topGaragesByAppointments && analytics.topGaragesByAppointments.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Top 10 Garages par Nombre de Rendez-vous</h3>
          <div className="space-y-3">
            {analytics.topGaragesByAppointments.map((item: any, index: number) => (
              <div key={item.garageId} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--color-racine-50)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-noir)' }}>{item.name || 'Garage'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.rating && (
                        <>
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-rose-600)' }}>
                            {item.rating.average?.toFixed(1) || '0.0'}
                          </span>
                          <svg className="w-3 h-3" style={{ color: 'var(--color-rose-500)' }} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: 'var(--color-rouge-600)' }}>{item.count}</p>
                  <p className="text-xs" style={{ color: 'var(--color-noir-500)' }}>rendez-vous</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Répartition géographique */}
      {analytics.garagesByCity && analytics.garagesByCity.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Répartition par Ville (Top 10)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {analytics.garagesByCity.map((item: any) => (
              <div key={item._id} className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--color-racine-50)' }}>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-noir)' }}>{item._id || 'Non spécifié'}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-rouge-600)' }}>{item.count}</p>
                <p className="text-xs" style={{ color: 'var(--color-noir-500)' }}>garages</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services populaires */}
      {analytics.popularServices && analytics.popularServices.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Services les Plus Populaires (Top 10)</h3>
          <div className="space-y-2">
            {analytics.popularServices.map((service: any, index: number) => {
              const maxCount = analytics.popularServices[0]?.count || 1;
              const percentage = (service.count / maxCount) * 100;
              return (
                <div key={service._id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-racine-50)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-noir)' }}>{service._id}</p>
                      <p className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                        {service.category || 'Non catégorisé'}
                      </p>
                    </div>
                    <p className="font-bold" style={{ color: 'var(--color-rouge-600)' }}>{service.count}</p>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: 'var(--color-rose-500)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

