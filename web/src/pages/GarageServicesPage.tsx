import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

interface Service {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price?: number;
  priceType: string;
  duration?: number;
  isActive: boolean;
}

export default function GarageServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [garageId, setGarageId] = useState<string | null>(null);

  // Formulaire
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("reparation");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("variable");
  const [duration, setDuration] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadGarageAndServices();
  }, []);

  const loadGarageAndServices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger le garage pour obtenir l'ID
      const garageRes = await api.get("/garages/me");
      const garage = garageRes.data.garage;
      setGarageId(garage._id);

      // Charger les services
      const servicesRes = await api.get(`/services/garage/${garage._id}`);
      setServices(servicesRes.data.services || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("reparation");
    setPrice("");
    setPriceType("variable");
    setDuration("");
    setIsActive(true);
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || "");
    setCategory(service.category);
    setPrice(service.price?.toString() || "");
    setPriceType(service.priceType);
    setDuration(service.duration?.toString() || "");
    setIsActive(service.isActive);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const serviceData: any = {
        name,
        description: description || undefined,
        category,
        priceType,
        isActive,
      };

      if (price) {
        serviceData.price = parseFloat(price);
      }
      if (duration) {
        serviceData.duration = parseInt(duration);
      }

      if (editingService) {
        await api.put(`/services/${editingService._id}`, serviceData);
      } else {
        await api.post("/services", serviceData);
      }

      resetForm();
      loadGarageAndServices();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le service "${name}" ?`)) {
      return;
    }

    try {
      await api.delete(`/services/${id}`);
      loadGarageAndServices();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      await api.put(`/services/${service._id}`, { isActive: !service.isActive });
      loadGarageAndServices();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: { [key: string]: string } = {
      reparation: "Réparation",
      entretien: "Entretien",
      depannage: "Dépannage",
      "vente-pieces": "Vente de pièces",
      carrosserie: "Carrosserie",
      peinture: "Peinture",
      revision: "Révision",
      autre: "Autre",
    };
    return labels[cat] || cat;
  };

  const getPriceTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      fixe: "Prix fixe",
      variable: "Prix variable",
      "sur-devis": "Sur devis",
    };
    return labels[type] || type;
  };

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
              Mes Services
            </h1>
            <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>
              Gérez les services proposés par votre garage
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
          >
            <span className="relative z-10">+ Ajouter un service</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="mb-6 bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-slideIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>
              {editingService ? "Modifier le service" : "Nouveau Service"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Nom du service *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ex: Vidange"
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
                    Catégorie *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-rose-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-racine-200)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="reparation">Réparation</option>
                    <option value="entretien">Entretien</option>
                    <option value="depannage">Dépannage</option>
                    <option value="vente-pieces">Vente de pièces</option>
                    <option value="carrosserie">Carrosserie</option>
                    <option value="peinture">Peinture</option>
                    <option value="revision">Révision</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du service..."
                    rows={3}
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
                    Type de prix *
                  </label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all duration-300 text-sm focus:ring-2 focus:ring-offset-2"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-rose-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-racine-200)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="fixe">Prix fixe</option>
                    <option value="variable">Prix variable</option>
                    <option value="sur-devis">Sur devis</option>
                  </select>
                </div>
                {priceType === "fixe" && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                      Prix (XOF)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="1"
                      placeholder="0"
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
                )}
                {priceType !== "sur-devis" && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                      Prix indicatif (XOF)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="1"
                      placeholder="0.00"
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
                )}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Durée estimée (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="0"
                    placeholder="Ex: 60"
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-rose-600)' }}
                  />
                  <label className="text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>
                    Service actif
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
                >
                  <span className="relative z-10">{saving ? "Enregistrement..." : editingService ? "Modifier" : "Créer"}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir-700)' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des services */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-12 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
            <svg className="w-24 h-24 mx-auto mb-4" style={{ color: 'var(--color-noir-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
              Aucun service
            </h2>
            <p className="text-base mb-6" style={{ color: 'var(--color-noir-600)' }}>
              Ajoutez votre premier service pour commencer
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
            >
              <span className="relative z-10">+ Ajouter un service</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white/90 backdrop-blur-md rounded-xl p-5 sm:p-6 shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
                style={{ borderColor: service.isActive ? 'var(--color-racine-200)' : 'var(--color-noir-300)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-noir)' }}>
                      {service.name}
                    </h3>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--color-rose-100)',
                        color: 'var(--color-rose-700)',
                      }}
                    >
                      {getCategoryLabel(service.category)}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-200 ${
                      service.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                    title={service.isActive ? "Désactiver" : "Activer"}
                  >
                    {service.isActive ? "✓" : "✗"}
                  </button>
                </div>

                {service.description && (
                  <p className="text-sm mb-3" style={{ color: 'var(--color-noir-600)' }}>
                    {service.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: 'var(--color-noir-600)' }}>💰</span>
                    <span style={{ color: 'var(--color-noir-700)' }}>
                      {getPriceTypeLabel(service.priceType)}
                    {service.price && ` - ${(service.price || 0).toLocaleString()} XOF`}
                    </span>
                  </div>
                  {service.duration && (
                    <div className="flex items-center gap-2 text-sm">
                      <span style={{ color: 'var(--color-noir-600)' }}>⏱️</span>
                      <span style={{ color: 'var(--color-noir-700)' }}>
                        {service.duration} minutes
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                    style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                  >
                    <span className="relative z-10">✏️ Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(service._id, service.name)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                    style={{ backgroundColor: 'var(--color-noir-600)', color: 'white' }}
                  >
                    <span className="relative z-10">🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

