import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth";
import GarageMap from "../components/Map/GarageMap";

interface Garage {
  _id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  rating: {
    average: number;
    count: number;
  };
  images?: string[];
  isVerified: boolean;
  isActive: boolean;
  openingHours?: any;
}

export default function GarageSearchPage() {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [searchCity, setSearchCity] = useState("");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "name">("rating");
  const [minRating, setMinRating] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [usingLocation, setUsingLocation] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const navigate = useNavigate();

  // Calculer la distance entre deux points (formule Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Obtenir la position de l'utilisateur
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setUsingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        searchNearbyGarages(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        alert("Erreur de géolocalisation: " + error.message);
        setUsingLocation(false);
      }
    );
  };

  const searchNearbyGarages = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/garages/nearby", {
        params: { latitude: lat, longitude: lng, maxDistance: 50000 }, // 50km
      });
      setGarages(res.data.garages);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la recherche");
    } finally {
      setLoading(false);
      setUsingLocation(false);
    }
  };

  const searchGarages = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { isActive: "true" };
      if (searchCity) params.city = searchCity;
      if (showVerifiedOnly) params.isVerified = "true";

      const res = await api.get("/garages", { params });
      let results = res.data.garages;

      // Filtrer par terme de recherche (nom) côté client
      if (searchTerm) {
        results = results.filter((garage: Garage) =>
          garage.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtrer par note minimale
      if (minRating > 0) {
        results = results.filter((garage: Garage) => (garage.rating?.average || 0) >= minRating);
      }

      // Calculer les distances si on a une localisation
      if (userLocation) {
        results = results.map((garage: Garage) => {
          if (garage.location?.coordinates) {
            const [lng, lat] = garage.location.coordinates;
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              lat,
              lng
            );
            return { ...garage, distance };
          }
          return garage;
        });
      }

      // Trier selon le critère sélectionné
      results.sort((a: any, b: any) => {
        switch (sortBy) {
          case "distance":
            if (a.distance !== undefined && b.distance !== undefined) {
              return a.distance - b.distance;
            }
            if (a.distance !== undefined) return -1;
            if (b.distance !== undefined) return 1;
            return (b.rating?.average || 0) - (a.rating?.average || 0);
          case "name":
            return a.name.localeCompare(b.name);
          case "rating":
          default:
            return (b.rating?.average || 0) - (a.rating?.average || 0);
        }
      });

      setGarages(results);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  // Charger les favoris si connecté
  useEffect(() => {
    if (isAuthenticated && user?.role === "client") {
      const loadFavorites = async () => {
        try {
          const res = await api.get("/favorites");
          const favoriteGarageIds = res.data.favorites?.map((f: any) => f.garageId?._id || f.garageId) || [];
          setFavorites(new Set(favoriteGarageIds));
        } catch (e) {
          // Ignorer
        }
      };
      loadFavorites();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    searchGarages();
  }, [showVerifiedOnly, minRating, sortBy]);

  const toggleFavorite = async (garageId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || user?.role !== "client") {
      return;
    }

    const isFavorite = favorites.has(garageId);

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${garageId}`);
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(garageId);
          return newSet;
        });
      } else {
        await api.post("/favorites", { garageId });
        setFavorites((prev) => new Set([...prev, garageId]));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout/retrait des favoris");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGarages();
  };

  const getCurrentDay = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
  };

  const isOpenNow = (garage: Garage): boolean => {
    if (!garage.openingHours) return true;
    const today = getCurrentDay();
    const hours = garage.openingHours[today];
    if (!hours || hours.closed) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    return currentTime >= hours.open && currentTime <= hours.close;
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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
          Trouver un garage
        </h1>

        {/* Barre de recherche et filtres */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Rechercher un garage par nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Ville..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
              >
                <span className="relative z-10">🔍 Rechercher</span>
              </button>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={usingLocation}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 relative overflow-hidden"
                style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
              >
                <span className="relative z-10">{usingLocation ? "📍 Localisation..." : "📍 Garages près de moi"}</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVerifiedOnly}
                  onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--color-rouge-600)' }}
                />
                <span className="text-sm" style={{ color: 'var(--color-noir-700)' }}>
                  Vérifiés uniquement
                </span>
              </label>
            </div>

            {/* Filtres et tri avancés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Note minimale
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border-2 outline-none transition-all text-sm"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                >
                  <option value={0}>Toutes les notes</option>
                  <option value={4}>4 étoiles et plus</option>
                  <option value={3}>3 étoiles et plus</option>
                  <option value={2}>2 étoiles et plus</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "rating" | "distance" | "name")}
                  className="w-full px-3 py-2 rounded-lg border-2 outline-none transition-all text-sm"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                >
                  <option value="rating">Note (meilleure d'abord)</option>
                  {userLocation && <option value="distance">Distance (plus proche)</option>}
                  <option value="name">Nom (A-Z)</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement des garages...</div>
          </div>
        )}

        {/* Liste des garages */}
        {!loading && garages.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-md border" style={{ borderColor: 'var(--color-racine-200)' }}>
            <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>
              Aucun garage trouvé. Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}

        {!loading && garages.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                {garages.length} garage{garages.length > 1 ? 's' : ''} trouvé{garages.length > 1 ? 's' : ''}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === "list" 
                      ? "bg-[var(--color-rouge-600)] text-white shadow-md" 
                      : "bg-white/50 text-[var(--color-noir-600)] border-2"
                  }`}
                  style={viewMode === "list" ? {} : { borderColor: 'var(--color-racine-200)' }}
                >
                  📋 Liste
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === "map" 
                      ? "bg-[var(--color-rouge-600)] text-white shadow-md" 
                      : "bg-white/50 text-[var(--color-noir-600)] border-2"
                  }`}
                  style={viewMode === "map" ? {} : { borderColor: 'var(--color-racine-200)' }}
                >
                  🗺️ Carte
                </button>
              </div>
            </div>

            {viewMode === "map" ? (
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border p-4 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
                <GarageMap
                  garages={garages.filter(g => g.location?.coordinates && g.location.coordinates[0] !== 0 && g.location.coordinates[1] !== 0)}
                  center={
                    userLocation 
                      ? [userLocation.lat, userLocation.lng] 
                      : garages.filter(g => g.location?.coordinates && g.location.coordinates[0] !== 0).length > 0
                      ? (() => {
                          const firstGarage = garages.find(g => g.location?.coordinates && g.location.coordinates[0] !== 0);
                          return firstGarage ? [firstGarage.location.coordinates[1], firstGarage.location.coordinates[0]] : [48.8566, 2.3522];
                        })()
                      : [48.8566, 2.3522]
                  }
                  zoom={userLocation ? 12 : garages.filter(g => g.location?.coordinates && g.location.coordinates[0] !== 0).length === 1 ? 15 : 10}
                  height="600px"
                  showMarkerPopup={true}
                  onMarkerClick={(garage) => navigate(`/app/garage/${garage._id}`)}
                />
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {garages.map((garage) => {
                const openNow = isOpenNow(garage);
                const distance = (garage as any).distance;

                return (
                    <Link
                      key={garage._id}
                      to={`/app/garage/${garage._id}`}
                      className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] animate-fadeIn"
                      style={{ borderColor: 'var(--color-racine-200)' }}
                    >
                    {/* Image du garage */}
                    <div className="h-48 flex items-center justify-center relative" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-100), var(--color-rose-100))' }}>
                      {garage.images && garage.images.length > 0 ? (
                        <img
                          src={garage.images[0]}
                          alt={garage.name}
                          className="w-full h-full object-cover"
                        />
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
                      {isAuthenticated && user?.role === "client" && (
                        <button
                          onClick={(e) => toggleFavorite(garage._id, e)}
                          className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 active:scale-95 shadow-md hover:shadow-lg z-10 backdrop-blur-sm"
                          style={{ backgroundColor: favorites.has(garage._id) ? 'var(--color-rose-600)' : 'rgba(255,255,255,0.9)', color: favorites.has(garage._id) ? 'white' : 'var(--color-noir-600)' }}
                        >
                          {favorites.has(garage._id) ? '❤️' : '🤍'}
                        </button>
                      )}
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: openNow ? 'var(--color-rouge-600)' : 'var(--color-noir-600)', color: 'white' }}>
                        {openNow ? "🟢 Ouvert" : "🔴 Fermé"}
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
                        {garage.name}
                      </h3>

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
                        {distance !== undefined && (
                          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-rose-600)' }}>
                            📍 {distance.toFixed(1)} km
                          </div>
                        )}
                      </div>

                      {garage.description && (
                        <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-noir-600)' }}>
                          {garage.description}
                        </p>
                      )}

                      <div className="pt-3 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                            {garage.phone}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-rouge-600)' }}>
                            Voir détails →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

