import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth";
import ImageUpload from "../components/ImageUpload/ImageUpload";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  garageId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "reviews">("profile");

  // Formulaire profil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string>("");

  // Formulaire mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (user && user.role !== "client") {
      navigate("/app", { replace: true });
      return;
    }

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
      loadReviews();
      setLoading(false);
    }
  }, [isAuthenticated, user, navigate]);

  const loadReviews = async () => {
    try {
      // Charger les avis de l'utilisateur
      const res = await api.get("/reviews");
      const allReviews = res.data.reviews || [];
      // Filtrer seulement ceux de l'utilisateur connecté
      const userId = user?._id || user?.id;
      setReviews(allReviews.filter((r: Review & { clientId: any }) => 
        r.clientId?._id === userId || r.clientId === userId
      ));
    } catch (err) {
      // Ignorer si pas d'avis
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.put("/users/profile", {
        name,
        phone: phone || undefined,
        avatar: avatar || undefined,
        // Note: updateProfile ne permet pas de changer l'email actuellement
      });

      setUser(res.data.user || { ...user, name, phone, avatar });
      setSuccess("Profil mis à jour avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setSaving(false);
      return;
    }

    try {
      // Note: Endpoint à créer dans le backend
      await api.put("/users/profile/password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Mot de passe modifié avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setSaving(false);
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
              <linearGradient id={`half-profile`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-profile)`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== "client") {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
          Mon Profil
        </h1>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--color-racine-200)' }}>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                activeTab === "profile" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "profile" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "profile" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                activeTab === "password" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "password" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "password" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Mot de passe
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
              Mes avis ({reviews.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Photo de profil
                  </label>
                  <div className="flex items-start gap-4">
                    {avatar && (
                      <div className="relative">
                        <img
                          src={avatar}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover border-2"
                          style={{ borderColor: 'var(--color-racine-200)' }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <ImageUpload
                        onUploadComplete={(urls) => setAvatar(urls[0] || "")}
                        maxImages={1}
                        folder="avatars"
                        multiple={false}
                        label="Changer la photo de profil"
                        initialUrls={avatar ? [avatar] : []}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm cursor-not-allowed opacity-60"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'var(--color-racine-50)' }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-noir-500)' }}>
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                >
                  <span className="relative z-10">{saving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
                </button>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Mot de passe actuel *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Confirmer le nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                >
                  <span className="relative z-10">{saving ? "Changement..." : "Changer le mot de passe"}</span>
                </button>
              </form>
            )}

            {activeTab === "reviews" && (
              <div>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-noir-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className="text-base mb-4" style={{ color: 'var(--color-noir-600)' }}>
                      Vous n'avez pas encore laissé d'avis
                    </p>
                  </div>
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
                              {review.garageId?.name || "Garage"}
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
                        {review.garageId?._id && (
                          <Link
                            to={`/app/garage/${review.garageId._id}`}
                            className="inline-block mt-2 text-xs font-semibold hover:underline"
                            style={{ color: 'var(--color-rouge-600)' }}
                          >
                            Voir le garage →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

