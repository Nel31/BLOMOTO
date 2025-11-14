import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [garages, setGarages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    rating: "",
    verified: "",
    garageId: "",
  });

  useEffect(() => {
    loadGarages();
    loadReviews();
  }, []);

  const loadGarages = async () => {
    try {
      const res = await api.get("/garages");
      setGarages(res.data.garages || []);
    } catch (err: any) {
      console.error("Erreur lors du chargement des garages:", err);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.rating) params.rating = filters.rating;
      if (filters.verified !== "") params.verified = filters.verified;
      if (filters.garageId) params.garageId = filters.garageId;

      const res = await api.get("/admin/reviews", { params });
      setReviews(res.data.reviews || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      return;
    }

    try {
      await api.delete(`/admin/reviews/${id}`);
      loadReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
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

  const applyFilters = () => {
    loadReviews();
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
        Modération des Avis
      </h1>

      {/* Filtres */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Filtres</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
              Garage
            </label>
            <select
              value={filters.garageId}
              onChange={(e) => setFilters({ ...filters, garageId: e.target.value })}
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
              Note
            </label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
            >
              <option value="">Toutes</option>
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
              Vérifié
            </label>
            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
            >
              <option value="">Tous</option>
              <option value="true">Vérifiés</option>
              <option value="false">Non vérifiés</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
            >
              <span className="relative z-10">Appliquer</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Liste des avis */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-12 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>Aucun avis trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const date = new Date(review.createdAt);
            return (
              <div
                key={review._id}
                className="bg-white/90 backdrop-blur-md rounded-xl p-5 sm:p-6 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
                style={{ borderColor: 'var(--color-racine-200)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {review.clientId?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-base" style={{ color: 'var(--color-noir)' }}>
                          {review.clientId?.name || 'Client'}
                        </h3>
                        <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                          {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {review.isVerified && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                            ✓ Vérifié
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--color-noir-600)' }}>
                        Pour: <span className="font-semibold">{review.garageId?.name || 'Garage'}</span>
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-noir-700)' }}>
                          {review.rating}/5
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm" style={{ color: 'var(--color-noir-700)' }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                    style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                  >
                    <span className="relative z-10">🗑️ Supprimer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

