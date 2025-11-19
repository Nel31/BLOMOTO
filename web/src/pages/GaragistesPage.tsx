import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function GaragistesPage() {
  const [garagistes, setGaragistes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Formulaire
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const loadGaragistes = () => {
    setLoading(true);
    api
      .get("/admin/garagistes")
      .then((res) => {
        setGaragistes(res.data.garagistes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Erreur");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGaragistes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);

    try {
      await api.post("/admin/garagistes", {
        name, // Nom du garage
        email,
        password,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        postalCode: postalCode || undefined,
      });
      
      // Réinitialiser le formulaire
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setAddress("");
      setCity("");
      setPostalCode("");
      setShowForm(false);
      
      // Recharger la liste
      loadGaragistes();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le garagiste "${name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await api.delete(`/admin/garagistes/${id}`);
      loadGaragistes();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading && garagistes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-noir)' }}>
          Garagistes
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
        >
          <span className="relative z-10">{showForm ? "Annuler" : "+ Créer un garagiste"}</span>
        </button>
      </div>

      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {formError}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl border animate-slideIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-noir)' }}>Nouveau Garagiste</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Nom du garage *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Garage Auto Paris"
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
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
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
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 X XX XX XX XX"
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
                  Adresse
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: 123 Rue de la Paix"
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
                  Ville
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Paris"
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
                  Code postal
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Ex: 75001"
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
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
            >
              <span className="relative z-10">{creating ? "Création..." : "Créer le compte"}</span>
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          Erreur: {error}
        </div>
      )}
      
      {garagistes.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>Aucun garagiste enregistré</p>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border overflow-hidden animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-racine-50)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Garage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-racine-200)' }}>
                {garagistes.map((g, index) => (
                  <tr key={g._id || index} className="hover:bg-opacity-50 hover:shadow-md transition-all duration-200" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-racine-50)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>{g.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>{g.email}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>{g.garageId?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: g.garageId?.isActive ? 'var(--color-rouge-100)' : 'var(--color-noir-200)',
                          color: g.garageId?.isActive ? 'var(--color-rouge-700)' : 'var(--color-noir-600)'
                        }}
                      >
                        {g.garageId?.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(g._id, g.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                        style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                      >
                        <span className="relative z-10">Supprimer</span>
                      </button>
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

