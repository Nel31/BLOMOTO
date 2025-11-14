import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

interface Review {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  isVerified: boolean;
}

export default function GarageReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [garageId, setGarageId] = useState<string | null>(null);

  useEffect(() => {
    loadGarageAndReviews();
  }, []);

  const loadGarageAndReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger le garage
      const garageRes = await api.get("/garages/me");
      const garage = garageRes.data.garage;
      setGarageId(garage._id);
      setStats({
        average: garage.rating.average,
        count: garage.rating.count,
      });

      // Charger les avis
      const reviewsRes = await api.get(`/reviews/garage/${garage._id}`);
      setReviews(reviewsRes.data.reviews || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={i} className="w-5 h-5" style={{ color: 'var(--color-rose-500)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-5 h-5" style={{ color: 'var(--color-rose-500)' }} fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${rating}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${rating})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={i} className="w-5 h-5" style={{ color: 'var(--color-noir-300)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

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
              Avis Clients
            </h1>
            <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>
              Consultez tous les avis reçus
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Note moyenne</h3>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold" style={{ color: 'var(--color-rose-600)' }}>
                  {stats.average.toFixed(1)}
                </div>
                <div className="flex-1">
                  {renderStars(stats.average)}
                  <p className="text-sm mt-2" style={{ color: 'var(--color-noir-600)' }}>
                    Sur {stats.count} avis
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Répartition des notes</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = distribution[rating as keyof typeof distribution];
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-12" style={{ color: 'var(--color-noir-700)' }}>
                        {rating} ⭐
                      </span>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: 'var(--color-rose-500)',
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right" style={{ color: 'var(--color-noir-600)' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Liste des avis */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-12 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <svg className="w-24 h-24 mx-auto mb-4" style={{ color: 'var(--color-noir-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
              Aucun avis
            </h2>
            <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>
              Aucun client n'a encore laissé d'avis pour votre garage
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewDate = new Date(review.createdAt);
              return (
                <div
                  key={review._id}
                  className="bg-white/90 backdrop-blur-md rounded-xl p-5 sm:p-6 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
                  style={{ borderColor: 'var(--color-racine-200)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {review.clientId?.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-base" style={{ color: 'var(--color-noir)' }}>
                            {review.clientId?.name || "Client"}
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                            {reviewDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          {review.isVerified && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                              ✓ Vérifié
                            </span>
                          )}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm mt-2" style={{ color: 'var(--color-noir-700)' }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

