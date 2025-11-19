import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => {
        setUsers(res.data.users);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Erreur");
        setLoading(false);
      });
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return { bg: 'var(--color-racine-100)', text: 'var(--color-racine-700)' };
      case 'garagiste':
        return { bg: 'var(--color-rose-100)', text: 'var(--color-rose-700)' };
      case 'client':
        return { bg: 'var(--color-rouge-100)', text: 'var(--color-rouge-700)' };
      default:
        return { bg: 'var(--color-noir-200)', text: 'var(--color-noir-600)' };
    }
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
        Utilisateurs
      </h1>
      
      {users.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center shadow-xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>Aucun utilisateur enregistré</p>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border overflow-hidden animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-racine-50)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--color-noir)' }}>Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-racine-200)' }}>
                {users.map((u, index) => {
                  const roleColors = getRoleColor(u.role);
                  return (
                    <tr key={u._id} className="hover:bg-opacity-50 hover:shadow-md transition-all duration-200" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--color-racine-50)' }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>{u.name}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-noir-600)' }}>{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ backgroundColor: roleColors.bg, color: roleColors.text }}
                        >
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
