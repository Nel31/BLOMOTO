import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth";
import ChatWindow from "../components/Chat/ChatWindow";
import SingleGarageMap from "../components/Map/SingleGarageMap";

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
    coordinates: [number, number];
  };
  phone: string;
  email?: string;
  website?: string;
  rating: {
    average: number;
    count: number;
  };
  images?: string[];
  isVerified: boolean;
  openingHours?: any;
  ownerId?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  duration?: number;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  clientId: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function GarageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user);

  const [garage, setGarage] = useState<Garage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "services" | "reviews">("info");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [garagisteId, setGaragisteId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Charger le garage
        const garageRes = await api.get(`/garages/${id}`);
        const garageData = garageRes.data.garage;
        setGarage(garageData);
        
        // Stocker l'ID du garagiste pour le chat
        if (garageData.ownerId) {
          const ownerId = typeof garageData.ownerId === 'object' ? garageData.ownerId._id : garageData.ownerId;
          setGaragisteId(ownerId);
        }

        // Charger les services
        try {
          const servicesRes = await api.get(`/services/garage/${id}`);
          setServices(servicesRes.data.services || []);
        } catch (e) {
          // Pas de services
        }

        // Charger les avis
        try {
          const reviewsRes = await api.get(`/reviews/garage/${id}`);
          setReviews(reviewsRes.data.reviews || []);
        } catch (e) {
          // Pas d'avis
        }

        // Vérifier si le garage est en favori
        if (isAuthenticated && user?.role === "client") {
          try {
            const favoriteRes = await api.get(`/favorites/check/${id}`);
            setIsFavorite(favoriteRes.data.isFavorite || false);
          } catch (e) {
            // Ignorer
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isAuthenticated, user]);

  const toggleFavorite = async () => {
    if (!isAuthenticated || user?.role !== "client" || !id) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post("/favorites", { garageId: id });
        setIsFavorite(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout/retrait des favoris");
    } finally {
      setFavoriteLoading(false);
    }
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
          <svg key={i} className="w-5 h-5" style={{ color: 'var(--color-rose-500)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-5 h-5" style={{ color: 'var(--color-rose-500)' }} fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${id}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  if (error || !garage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md border text-center max-w-md" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base mb-4" style={{ color: 'var(--color-noir-700)' }}>
            {error || "Garage non trouvé"}
          </p>
          <button
            onClick={() => navigate("/app/garages")}
            className="px-6 py-2.5 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const openNow = isOpenNow(garage);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Bouton retour */}
        <button
          onClick={() => navigate("/app/garages")}
          className="mb-6 flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: 'var(--color-noir-600)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à la liste
        </button>

        {/* En-tête du garage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border mb-6" style={{ borderColor: 'var(--color-racine-200)' }}>
          {/* Image principale */}
          <div className="h-64 sm:h-80 flex items-center justify-center relative" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-100), var(--color-rose-100))' }}>
            {garage.images && garage.images.length > 0 ? (
              <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-32 h-32" style={{ color: 'var(--color-racine-400)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
            {garage.isVerified && (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}>
                ✓ Vérifié
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: openNow ? 'var(--color-rouge-600)' : 'var(--color-noir-600)', color: 'white' }}>
              {openNow ? "🟢 Ouvert" : "🔴 Fermé"}
            </div>
          </div>

          {/* Informations principales */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-noir)' }}>
                    {garage.name}
                  </h1>
                  {isAuthenticated && user?.role === "client" && (
                    <button
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg"
                      style={{ backgroundColor: isFavorite ? 'var(--color-rose-600)' : 'var(--color-racine-100)', color: isFavorite ? 'white' : 'var(--color-noir-600)' }}
                      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      {isFavorite ? '❤️' : '🤍'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  {renderStars(garage.rating?.average || 0)}
                  <span className="text-base" style={{ color: 'var(--color-noir-600)' }}>
                    {garage.rating?.average?.toFixed(1) || "0.0"} ({garage.rating?.count || 0} avis)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {garage.address.street}, {garage.address.city} {garage.address.postalCode}
                </div>
              </div>
              {isAuthenticated && user?.role === "client" && (
                <div className="flex gap-2">
                  {garagisteId && (
                    <button
                      onClick={() => setShowChat(true)}
                      className="px-4 py-3 bg-white border-2 hover:bg-[var(--color-racine-50)] font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap hover:scale-105 active:scale-95"
                      style={{ borderColor: 'var(--color-rouge-600)', color: 'var(--color-rouge-600)' }}
                    >
                      💬 Contacter
                    </button>
                  )}
                  <Link
                    to={`/app/garage/${garage._id}/book`}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap hover:scale-105 active:scale-95"
                  >
                    Réserver un rendez-vous
                  </Link>
                </div>
              )}
            </div>

            {garage.description && (
              <p className="text-base mb-4" style={{ color: 'var(--color-noir-700)' }}>
                {garage.description}
              </p>
            )}

            {/* Coordonnées */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: 'var(--color-rouge-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm" style={{ color: 'var(--color-noir-700)' }}>{garage.phone}</span>
              </div>
              {garage.email && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: 'var(--color-rose-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--color-noir-700)' }}>{garage.email}</span>
                </div>
              )}
              {garage.website && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: 'var(--color-racine-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={garage.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--color-rouge-600)' }}>
                    {garage.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border mb-6" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--color-racine-200)' }}>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                activeTab === "info" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "info" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "info" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                activeTab === "services" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "services" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "services" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                activeTab === "reviews" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "reviews" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "reviews" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Avis ({reviews.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "info" && (
              <div className="space-y-6">
                {garage.openingHours && (
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Horaires d'ouverture</h3>
                    <div className="space-y-2">
                      {Object.entries(garage.openingHours).map(([day, hours]: [string, any]) => (
                        <div key={day} className="flex justify-between items-center text-sm">
                          <span className="capitalize font-medium" style={{ color: 'var(--color-noir-700)' }}>
                            {day === "monday" ? "Lundi" : day === "tuesday" ? "Mardi" : day === "wednesday" ? "Mercredi" : day === "thursday" ? "Jeudi" : day === "friday" ? "Vendredi" : day === "saturday" ? "Samedi" : "Dimanche"}
                          </span>
                          <span style={{ color: 'var(--color-noir-600)' }}>
                            {hours.closed ? "Fermé" : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {garage.location && garage.location.coordinates && (
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Localisation</h3>
                    <SingleGarageMap
                      latitude={garage.location.coordinates[1]}
                      longitude={garage.location.coordinates[0]}
                      garageName={garage.name}
                      address={`${garage.address.street}, ${garage.address.postalCode} ${garage.address.city}`}
                      height="400px"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "services" && (
              <div>
                {services.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                    Aucun service disponible pour ce garage
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div
                        key={service._id}
                        className="bg-white/50 rounded-lg p-4 border shadow-sm"
                        style={{ borderColor: 'var(--color-racine-200)' }}
                      >
                        <h4 className="font-bold mb-2" style={{ color: 'var(--color-noir)' }}>{service.name}</h4>
                        {service.description && (
                          <p className="text-sm mb-2" style={{ color: 'var(--color-noir-600)' }}>{service.description}</p>
                        )}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
                          <span className="text-xs uppercase font-semibold" style={{ color: 'var(--color-racine-600)' }}>
                            {service.category}
                          </span>
                          <span className="text-lg font-bold" style={{ color: 'var(--color-rouge-600)' }}>
                            {service.price}€
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {reviews.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                    Aucun avis pour ce garage
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white/50 rounded-lg p-4 border"
                        style={{ borderColor: 'var(--color-racine-200)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold" style={{ color: 'var(--color-noir)' }}>
                              {review.clientId?.name || "Anonyme"}
                            </span>
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-noir-500)' }}>
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm mt-2" style={{ color: 'var(--color-noir-700)' }}>
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!isAuthenticated && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-md border" style={{ borderColor: 'var(--color-racine-200)' }}>
            <p className="text-base mb-4" style={{ color: 'var(--color-noir-700)' }}>
              Connectez-vous pour réserver un rendez-vous
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="px-6 py-2.5 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChat && garagisteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowChat(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-racine-200)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-noir)' }}>Contacter le garagiste</h3>
              <button
                onClick={() => setShowChat(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--color-noir-600)' }}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <ChatWindow
                userId={garagisteId}
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

