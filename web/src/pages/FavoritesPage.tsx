import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth";

interface Garage {
  _id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  rating: {
    average: number;
    count: number;
  };
  images?: string[];
  isVerified: boolean;
  phone: string;
}

interface Favorite {
  _id: string;
  garageId: Garage;
  createdAt: string;
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user);

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (user && user.role !== "client") {
      navigate("/app", { replace: true });
      return;
    }

    loadFavorites();
  }, [isAuthenticated, user, navigate]);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/favorites");
      setFavorites(res.data.favorites || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (garageId: string, garageName: string) => {
    if (!confirm(`Retirer "${garageName}" de vos favoris ?`)) {
      return;
    }

    try {
      await api.delete(`/favorites/${garageId}`);
      loadFavorites();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
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
              <linearGradient id="half-fav">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#half-fav)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

  if (!isAuthenticated || (user && user.role !== "client")) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
          ❤️ Mes favoris
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-12 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <svg className="w-24 h-24 mx-auto mb-4" style={{ color: 'var(--color-noir-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
              Aucun favori
            </h2>
            <p className="text-base mb-6" style={{ color: 'var(--color-noir-600)' }}>
              Vous n'avez pas encore de garages favoris. Explorez les garages et ajoutez vos préférés !
            </p>
            <Link
              to="/app/garages"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Découvrir les garages
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm" style={{ color: 'var(--color-noir-600)' }}>
              {favorites.length} garage{favorites.length > 1 ? 's' : ''} favori{favorites.length > 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favorites.map((favorite) => {
                const garage = favorite.garageId;

                return (
                  <div
                    key={favorite._id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
                    style={{ borderColor: 'var(--color-racine-200)' }}
                  >
                    {/* Image */}
                    <div className="h-48 flex items-center justify-center relative" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-100), var(--color-rose-100))' }}>
                      {garage.images && garage.images.length > 0 ? (
                        <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-20 h-20" style={{ color: 'var(--color-racine-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                      {garage.isVerified && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                          ✓ Vérifié
                        </div>
                      )}
                      <button
                        onClick={() => removeFavorite(garage._id, garage.name)}
                        className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
                        title="Retirer des favoris"
                      >
                        ❤️
                      </button>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <Link to={`/app/garage/${garage._id}`}>
                        <h3 className="text-lg font-bold mb-2 hover:underline" style={{ color: 'var(--color-noir)' }}>
                          {garage.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(garage.rating?.average || 0)}
                        <span className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                          ({garage.rating?.count || 0} avis)
                        </span>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {garage.address.street}, {garage.address.city}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
                        <Link
                          to={`/app/garage/${garage._id}`}
                          className="flex-1 px-4 py-2 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center text-sm"
                        >
                          Voir détails
                        </Link>
                        {isAuthenticated && user?.role === "client" && (
                          <Link
                            to={`/app/garage/${garage._id}/book`}
                            className="px-4 py-2 bg-[var(--color-rose-600)] hover:bg-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                          >
                            Réserver
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

