import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [garages, setGarages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    garageId: "",
    isActive: "",
  });

  useEffect(() => {
    loadGarages();
    loadServices();
  }, []);

  const loadGarages = async () => {
    try {
      const res = await api.get("/garages");
      setGarages(res.data.garages || []);
    } catch (err: any) {
      console.error("Erreur lors du chargement des garages:", err);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.garageId) params.garageId = filters.garageId;
      if (filters.isActive !== "") params.isActive = filters.isActive;

      const res = await api.get("/admin/services", { params });
      setServices(res.data.services || []);
      setCategories(res.data.categories || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    loadServices();
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

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
        Gestion des Services
      </h1>

      {/* Statistiques par catégorie */}
      {categories.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Services par catégorie</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <div key={cat.category} className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-racine-50)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-noir-600)' }}>
                  {getCategoryLabel(cat.category)}
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--color-rouge-600)' }}>
                  {cat.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
              Catégorie
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
            >
              <option value="">Toutes</option>
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
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
              Statut
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all duration-300 text-sm"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
            >
              <option value="">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
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

      {/* Liste des services */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-12 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>Aucun service trouvé</p>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border overflow-hidden animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-racine-50)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Garage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Catégorie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Prix</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-racine-200)' }}>
                {services.map((service, index) => (
                  <tr key={service._id} className="hover:bg-opacity-50 hover:shadow-md transition-all duration-200" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-racine-50)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>
                      {service.name}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                      {service.garageId?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                      {getCategoryLabel(service.category)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>
                      {service.price ? `${service.price.toLocaleString()} XOF` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: service.isActive ? 'var(--color-rouge-100)' : 'var(--color-noir-200)',
                          color: service.isActive ? 'var(--color-rouge-700)' : 'var(--color-noir-600)'
                        }}
                      >
                        {service.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

