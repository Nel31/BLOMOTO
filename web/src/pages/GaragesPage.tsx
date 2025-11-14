import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function GaragesPage() {
  const [garages, setGarages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/garages")
      .then((res) => {
        setGarages(res.data.garages);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Erreur");
        setLoading(false);
      });
  }, []);

  const suspend = async (id: string) => {
    try {
      await api.put(`/admin/garages/${id}/suspend`);
      setGarages((prev) => prev.map((g) => (g._id === id ? { ...g, isActive: false } : g)));
    } catch {}
  };

  const activate = async (id: string) => {
    try {
      await api.put(`/admin/garages/${id}/activate`);
      setGarages((prev) => prev.map((g) => (g._id === id ? { ...g, isActive: true } : g)));
    } catch {}
  };

  const verify = async (id: string) => {
    try {
      await api.put(`/admin/garages/${id}/verify`);
      setGarages((prev) => prev.map((g) => (g._id === id ? { ...g, isVerified: true } : g)));
    } catch {}
  };

  const unverify = async (id: string) => {
    try {
      await api.put(`/admin/garages/${id}/unverify`);
      setGarages((prev) => prev.map((g) => (g._id === id ? { ...g, isVerified: false } : g)));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--color-noir)' }}>
        Garages
      </h1>
      
      {garages.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>Aucun garage enregistré</p>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border overflow-hidden animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-racine-50)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Ville</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Vérifié</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Actions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-racine-200)' }}>
                {garages.map((g, index) => (
                  <tr key={g._id} className="hover:bg-opacity-50 hover:shadow-md transition-all duration-200" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-racine-50)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>{g.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>{g.address?.city || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: g.isActive ? 'var(--color-rouge-100)' : 'var(--color-noir-200)',
                            color: g.isActive ? 'var(--color-rouge-700)' : 'var(--color-noir-600)'
                          }}
                        >
                          {g.isActive ? "Actif" : "Suspendu"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: g.isVerified ? 'var(--color-rose-100)' : 'var(--color-noir-200)',
                            color: g.isVerified ? 'var(--color-rose-700)' : 'var(--color-noir-600)'
                          }}
                        >
                          {g.isVerified ? "✓ Vérifié" : "Non vérifié"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {g.isActive ? (
                            <button
                              onClick={() => suspend(g._id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                              style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                            >
                              <span className="relative z-10">Suspendre</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => activate(g._id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                              style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
                            >
                              <span className="relative z-10">Activer</span>
                            </button>
                          )}
                          {g.isVerified ? (
                            <button
                              onClick={() => unverify(g._id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                              style={{ backgroundColor: 'var(--color-noir-600)', color: 'white' }}
                            >
                              <span className="relative z-10">Dévérifier</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => verify(g._id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                              style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
                            >
                              <span className="relative z-10">Vérifier</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/garages/${g._id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 inline-block"
                          style={{ backgroundColor: 'var(--color-racine-600)', color: 'white' }}
                        >
                          Voir détails
                        </Link>
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
