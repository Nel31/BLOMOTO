import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import ImageUpload from "../components/ImageUpload/ImageUpload";

interface Garage {
  _id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email?: string;
  website?: string;
  openingHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

export default function GarageSettingsPage() {
  const navigate = useNavigate();
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulaire
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [openingHours, setOpeningHours] = useState<any>({});
  const [images, setImages] = useState<string[]>([]);

  const days = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];

  useEffect(() => {
    loadGarage();
  }, []);

  const loadGarage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/garages/me");
      const garageData = res.data.garage;
      setGarage(garageData);

      // Remplir le formulaire
      setName(garageData.name || "");
      setDescription(garageData.description || "");
      setStreet(garageData.address?.street || "");
      setCity(garageData.address?.city || "");
      setPostalCode(garageData.address?.postalCode || "");
      setPhone(garageData.phone || "");
      setEmail(garageData.email || "");
      setWebsite(garageData.website || "");
      setOpeningHours(garageData.openingHours || {});
      setImages(garageData.images || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const garageData: any = {
        name,
        description: description || undefined,
        address: {
          street,
          city,
          postalCode,
          country: "France",
        },
        phone,
        email: email || undefined,
        website: website || undefined,
        images,
        openingHours,
      };

      await api.put("/garages/me", garageData);
      setSuccess("Informations mises à jour avec succès !");
      loadGarage();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const updateDayHours = (day: string, field: string, value: string | boolean) => {
    setOpeningHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen animate-fadeIn flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fadeIn" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
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
              Paramètres du garage
            </h1>
            <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>
              Modifiez les informations de votre garage
            </p>
          </div>
        </div>

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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border p-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
              Informations générales
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Nom du garage *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-rose-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-racine-200)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Description de votre garage..."
                  className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-rose-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-racine-200)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-rose-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-racine-200)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-rose-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-racine-200)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Site web
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-rose-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-racine-200)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border p-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
              Adresse
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Rue *
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-rose-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-racine-200)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-rose-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-racine-200)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-rose-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-racine-200)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border p-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
              Horaires d'ouverture
            </h2>
            <div className="space-y-3">
              {days.map((day) => {
                const dayHours = openingHours[day.key] || { open: "", close: "", closed: false };
                return (
                  <div key={day.key} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="w-24 text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-noir-700)' }}>
                      <input
                        type="checkbox"
                        checked={!dayHours.closed}
                        onChange={(e) => updateDayHours(day.key, "closed", !e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--color-rose-600)' }}
                      />
                      {day.label}
                    </label>
                    {!dayHours.closed ? (
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="time"
                          value={dayHours.open || ""}
                          onChange={(e) => updateDayHours(day.key, "open", e.target.value)}
                          className="px-3 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                          style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--color-rose-500)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--color-racine-200)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <input
                          type="time"
                          value={dayHours.close || ""}
                          onChange={(e) => updateDayHours(day.key, "close", e.target.value)}
                          className="px-3 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                          style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--color-rose-500)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--color-racine-200)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-sm italic" style={{ color: 'var(--color-noir-400)' }}>
                        Fermé
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Images du garage */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border p-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
              Images du garage
            </h2>
            <ImageUpload
              onUploadComplete={(urls) => setImages(urls)}
              maxImages={10}
              folder="garages"
              multiple={true}
              label="Ajouter des images du garage"
            />
            {images.length > 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-noir-600)' }}>
                {images.length} image(s) ajoutée(s)
              </p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            >
              <span className="relative z-10">{saving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
            </button>
            <Link
              to="/garage"
              className="px-6 py-3 border-2 font-semibold rounded-lg transition-all duration-300 text-center hover:scale-105 active:scale-95"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir-700)' }}
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

