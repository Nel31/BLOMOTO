import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../api/client";

interface Garage {
  _id: string;
  name: string;
  address: {
    city: string;
  };
  rating: {
    average: number;
    count: number;
  };
  images?: string[];
  isVerified: boolean;
}

export default function UserHomePage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = !!token && !!user;

  const [popularGarages, setPopularGarages] = useState<Garage[]>([]);
  const [recentGarages, setRecentGarages] = useState<Garage[]>([]);
  const [stats, setStats] = useState({
    appointments: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);

  // Hydrater l'utilisateur si token existe mais user pas encore chargé
  useEffect(() => {
    const hydrate = async () => {
      if (token && !user) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
        } catch (e) {
          // Erreur, token invalide - on supprime le token
          logout();
        }
      }
    };
    hydrate();
  }, [token, user, setUser, logout]);

  // Charger les données de la page d'accueil
  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        // Charger les garages populaires (par note)
        const popularRes = await api.get("/garages", {
          params: { isActive: "true" },
        });
        const allGarages = popularRes.data.garages || [];
        const sortedByRating = [...allGarages]
          .filter((g: Garage) => g.rating?.count > 0)
          .sort((a: Garage, b: Garage) => (b.rating?.average || 0) - (a.rating?.average || 0))
          .slice(0, 6);
        setPopularGarages(sortedByRating);

        // Charger les garages récents (par date de création)
        const recentSorted = [...allGarages]
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);
        setRecentGarages(recentSorted);

        // Charger les stats si connecté
        if (isAuthenticated && user?.role === "client") {
          try {
            const appointmentsRes = await api.get("/appointments/client/me");
            setStats((prev) => ({
              ...prev,
              appointments: appointmentsRes.data.appointments?.length || 0,
            }));
          } catch (e) {
            // Ignorer
          }
          try {
            const reviewsRes = await api.get("/reviews");
            const allReviews = reviewsRes.data.reviews || [];
            const userReviews = allReviews.filter((r: any) => {
              const clientId = typeof r.clientId === 'object' ? r.clientId?._id : r.clientId;
              const userId = (user as any)?._id || (user as any)?.id;
              return clientId && userId && clientId.toString() === userId.toString();
            });
            setStats((prev) => ({
              ...prev,
              reviews: userReviews.length,
            }));
          } catch (e) {
            // Ignorer
          }
        }
      } catch (err) {
        // Erreur, on ignore
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [isAuthenticated, user]);

  // Si connecté avec un rôle admin ou garagiste, rediriger vers leur dashboard
  if (isAuthenticated && user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "garagiste") {
      return <Navigate to="/garage" replace />;
    }
  }

  // Timeout pour l'hydratation si elle prend trop de temps
  useEffect(() => {
    if (token && !user) {
      const timer = setTimeout(() => {
        setHydrationTimeout(true);
      }, 2000); // Timeout de 2 secondes
      return () => clearTimeout(timer);
    } else {
      setHydrationTimeout(false);
    }
  }, [token, user]);

  if (token && !user && !hydrationTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-racine-50)] to-[var(--color-racine-100)] flex items-center justify-center">
        <div className="text-[var(--color-noir-700)] text-base sm:text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-racine-50)] via-white to-[var(--color-rose-50)]">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-noir)] mb-6 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] bg-clip-text text-transparent">
          Bienvenue
        </h1>
        
        {!isAuthenticated ? (
          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-base sm:text-lg text-[var(--color-noir-700)] text-center max-w-2xl">
              Bienvenue sur Promoto ! Créez un compte ou connectez-vous pour réserver un rendez-vous.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
              >
                Créer un compte
              </Link>
            </div>
            {/* Contenu accessible sans connexion */}
            <div className="mt-12 w-full bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-[var(--color-racine-200)]">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-noir)] mb-3">Rechercher un garage</h2>
              <p className="text-sm sm:text-base text-[var(--color-noir-600)] mb-4">Vous pouvez parcourir les garages disponibles...</p>
              <Link
                to="/app/garages"
                className="inline-block px-6 py-2.5 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
              >
                Voir tous les garages →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-md border border-[var(--color-racine-200)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-noir)]">
                  Bienvenue, <span className="text-[var(--color-rouge-600)]">{user?.name}</span> !
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-noir-600)] mt-1">Vous êtes connecté en tant que client</p>
              </div>
              <button
                onClick={logout}
                className="px-5 py-2 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
              >
                Déconnexion
              </button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-[var(--color-racine-200)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn">
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-rouge-600)' }}>
                  {stats.appointments}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                  Rendez-vous
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-[var(--color-racine-200)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn">
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-rose-600)' }}>
                  {stats.reviews}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                  Avis laissés
                </div>
              </div>
            </div>
            
            {/* Fonctionnalités pour utilisateur connecté */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <Link
                to="/app/appointments"
                className="bg-white/80 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-[var(--color-racine-200)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fadeIn"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-rouge-100)] rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[var(--color-rouge-200)] group-hover:scale-110 transition-all duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-rouge-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--color-noir)] mb-2">Mes rendez-vous</h3>
                <p className="text-sm sm:text-base text-[var(--color-noir-600)]">Consultez et gérez vos rendez-vous</p>
              </Link>
              
              <Link
                to="/app/garages"
                className="bg-white/80 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-[var(--color-racine-200)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fadeIn"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-rose-100)] rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[var(--color-rose-200)] group-hover:scale-110 transition-all duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-rose-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--color-noir)] mb-2">Rechercher un garage</h3>
                <p className="text-sm sm:text-base text-[var(--color-noir-600)]">Trouvez un garage près de chez vous</p>
              </Link>
              
              <Link
                to="/app/profile"
                className="bg-white/80 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-[var(--color-racine-200)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fadeIn"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-racine-100)] rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[var(--color-racine-200)] group-hover:scale-110 transition-all duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-racine-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--color-noir)] mb-2">Mon profil</h3>
                <p className="text-sm sm:text-base text-[var(--color-noir-600)]">Modifiez vos informations personnelles</p>
              </Link>
            </div>

            {/* Garages populaires */}
            {!loading && popularGarages.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-noir)' }}>
                    ⭐ Garages populaires
                  </h2>
                  <Link
                    to="/app/garages"
                    className="text-sm font-semibold hover:underline"
                    style={{ color: 'var(--color-rouge-600)' }}
                  >
                    Voir tout →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularGarages.slice(0, 3).map((garage) => (
                    <Link
                      key={garage._id}
                      to={`/app/garage/${garage._id}`}
                      className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] animate-fadeIn"
                      style={{ borderColor: 'var(--color-racine-200)' }}
                    >
                      <div className="h-32 flex items-center justify-center relative" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-100), var(--color-rose-100))' }}>
                        {garage.images && garage.images.length > 0 ? (
                          <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-12 h-12" style={{ color: 'var(--color-racine-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        {garage.isVerified && (
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1" style={{ color: 'var(--color-noir)' }}>{garage.name}</h3>
                        <p className="text-xs mb-2" style={{ color: 'var(--color-noir-600)' }}>{garage.address.city}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-rose-600)' }}>
                            ⭐ {garage.rating?.average?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                            ({garage.rating?.count || 0})
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Garages récents */}
            {!loading && recentGarages.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-noir)' }}>
                    🆕 Garages récents
                  </h2>
                  <Link
                    to="/app/garages"
                    className="text-sm font-semibold hover:underline"
                    style={{ color: 'var(--color-rouge-600)' }}
                  >
                    Voir tout →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentGarages.slice(0, 3).map((garage) => (
                    <Link
                      key={garage._id}
                      to={`/app/garage/${garage._id}`}
                      className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] animate-fadeIn"
                      style={{ borderColor: 'var(--color-racine-200)' }}
                    >
                      <div className="h-32 flex items-center justify-center relative" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-100), var(--color-rose-100))' }}>
                        {garage.images && garage.images.length > 0 ? (
                          <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-12 h-12" style={{ color: 'var(--color-racine-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        {garage.isVerified && (
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1" style={{ color: 'var(--color-noir)' }}>{garage.name}</h3>
                        <p className="text-xs mb-2" style={{ color: 'var(--color-noir-600)' }}>{garage.address.city}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-rose-600)' }}>
                            ⭐ {garage.rating?.average?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                            ({garage.rating?.count || 0})
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section garages populaires pour non connectés */}
        {!isAuthenticated && !loading && popularGarages.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-noir)' }}>
                ⭐ Garages populaires
              </h2>
              <Link
                to="/app/garages"
                className="text-sm font-semibold hover:underline"
                style={{ color: 'var(--color-rouge-600)' }}
              >
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularGarages.slice(0, 3).map((garage) => (
                <Link
                  key={garage._id}
                  to={`/app/garage/${garage._id}`}
                  className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  style={{ borderColor: 'var(--color-racine-200)' }}
                >
                  <div className="h-32 bg-gradient-to-br from-racine-100 to-rose-100 flex items-center justify-center relative">
                    {garage.images && garage.images.length > 0 ? (
                      <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12" style={{ color: 'var(--color-racine-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                    {garage.isVerified && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1" style={{ color: 'var(--color-noir)' }}>{garage.name}</h3>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-noir-600)' }}>{garage.address.city}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-rose-600)' }}>
                        ⭐ {garage.rating?.average?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                        ({garage.rating?.count || 0})
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

