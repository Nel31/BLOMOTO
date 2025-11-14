import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function AdminGarageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [garage, setGarage] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "appointments" | "services" | "reviews">("info");

  useEffect(() => {
    if (id) {
      loadGarageData();
    }
  }, [id]);

  const loadGarageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [garageRes, appointmentsRes, servicesRes, reviewsRes] = await Promise.all([
        api.get(`/garages/${id}`),
        api.get("/admin/appointments", { params: { garageId: id } }),
        api.get("/admin/services", { params: { garageId: id } }),
        api.get("/admin/reviews", { params: { garageId: id } }),
      ]);

      setGarage(garageRes.data.garage);
      setAppointments(appointmentsRes.data.appointments || []);
      setServices(servicesRes.data.services || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const verifyGarage = async () => {
    try {
      await api.put(`/admin/garages/${id}/verify`);
      setGarage((prev: any) => ({ ...prev, isVerified: true }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const unverifyGarage = async () => {
    try {
      await api.put(`/admin/garages/${id}/unverify`);
      setGarage((prev: any) => ({ ...prev, isVerified: false }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const suspendGarage = async () => {
    try {
      await api.put(`/admin/garages/${id}/suspend`);
      setGarage((prev: any) => ({ ...prev, isActive: false }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const activateGarage = async () => {
    try {
      await api.put(`/admin/garages/${id}/activate`);
      setGarage((prev: any) => ({ ...prev, isActive: true }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur");
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
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < rating ? '' : 'opacity-30'}`} style={{ color: i < rating ? 'var(--color-rose-500)' : 'var(--color-noir-300)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
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

  if (error || !garage) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || "Garage non trouvé"}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/garages")}
          className="flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: 'var(--color-noir-600)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux garages
        </button>
      </div>

      {/* Header du garage */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
              {garage.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                📍 {garage.address?.city || ''}, {garage.address?.postalCode || ''}
              </span>
              {garage.isVerified && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                  ✓ Vérifié
                </span>
              )}
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: garage.isActive ? 'var(--color-rouge-100)' : 'var(--color-noir-200)',
                  color: garage.isActive ? 'var(--color-rouge-700)' : 'var(--color-noir-600)'
                }}
              >
                {garage.isActive ? "Actif" : "Suspendu"}
              </span>
              {garage.rating && garage.rating.count > 0 && (
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(garage.rating.average))}
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-rose-600)' }}>
                    {garage.rating.average.toFixed(1)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                    ({garage.rating.count})
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {garage.isVerified ? (
              <button
                onClick={unverifyGarage}
                className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-noir-600)', color: 'white' }}
              >
                Dévérifier
              </button>
            ) : (
              <button
                onClick={verifyGarage}
                className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
              >
                Vérifier
              </button>
            )}
            {garage.isActive ? (
              <button
                onClick={suspendGarage}
                className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
              >
                Suspendre
              </button>
            ) : (
              <button
                onClick={activateGarage}
                className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
              >
                Activer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-rouge-200)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-rouge-600)' }}>
            {appointments.length}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
            Rendez-vous
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-rose-200)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-rose-600)' }}>
            {services.length}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
            Services
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-racine-600)' }}>
            {reviews.length}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
            Avis
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-rose-200)' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-rose-600)' }}>
            {garage.rating?.average?.toFixed(1) || "0.0"}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
            Note moyenne
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
        <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--color-racine-200)' }}>
          {[
            { key: "info", label: "📋 Informations", count: null },
            { key: "appointments", label: "📅 Rendez-vous", count: appointments.length },
            { key: "services", label: "🔧 Services", count: services.length },
            { key: "reviews", label: "⭐ Avis", count: reviews.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === tab.key ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === tab.key ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Description</h3>
                <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                  {garage.description || "Aucune description"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Adresse</h3>
                  <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                    {garage.address?.street || ''}
                    <br />
                    {garage.address?.postalCode || ''} {garage.address?.city || ''}
                    <br />
                    {garage.address?.country || ''}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Contact</h3>
                  <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                    📞 {garage.phone || '-'}
                    <br />
                    📧 {garage.email || '-'}
                    {garage.website && (
                      <>
                        <br />
                        🌐 <a href={garage.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{garage.website}</a>
                      </>
                    )}
                  </p>
                </div>
              </div>
              {garage.ownerId && (
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>Propriétaire</h3>
                  <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                    {garage.ownerId.name || '-'}
                    <br />
                    {garage.ownerId.email || '-'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-sm text-center" style={{ color: 'var(--color-noir-500)' }}>Aucun rendez-vous</p>
              ) : (
                appointments.map((apt) => {
                  const statusColors = getStatusColor(apt.status);
                  const date = new Date(apt.date);
                  return (
                    <div key={apt._id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-racine-200)', backgroundColor: 'var(--color-racine-50)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold" style={{ color: 'var(--color-noir)' }}>
                          {date.toLocaleDateString('fr-FR')} à {apt.time}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                          {statusColors.label}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                        👤 {apt.clientId?.name || 'Client'} • 🔧 {apt.serviceId?.name || 'Service'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-3">
              {services.length === 0 ? (
                <p className="text-sm text-center" style={{ color: 'var(--color-noir-500)' }}>Aucun service</p>
              ) : (
                services.map((service) => (
                  <div key={service._id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-racine-200)', backgroundColor: 'var(--color-racine-50)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold" style={{ color: 'var(--color-noir)' }}>
                        {service.name}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: service.isActive ? 'var(--color-rouge-100)' : 'var(--color-noir-200)',
                          color: service.isActive ? 'var(--color-rouge-700)' : 'var(--color-noir-600)'
                        }}
                      >
                        {service.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                      {service.category} • {service.price ? `${service.price}€` : 'Prix variable'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-center" style={{ color: 'var(--color-noir-500)' }}>Aucun avis</p>
              ) : (
                reviews.map((review) => {
                  const date = new Date(review.createdAt);
                  return (
                    <div key={review._id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-racine-200)', backgroundColor: 'var(--color-racine-50)' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {review.clientId?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold" style={{ color: 'var(--color-noir)' }}>
                              {review.clientId?.name || 'Client'}
                            </span>
                            {renderStars(review.rating)}
                            <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                              {date.toLocaleDateString('fr-FR')}
                            </span>
                            {review.isVerified && (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                                ✓
                              </span>
                            )}
                          </div>
                          {review.comment && (
                            <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

