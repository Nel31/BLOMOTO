import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore, UserRole } from "../store/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      setUser(res.data.user);

      const role: UserRole = res.data.user?.role || "client";
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "garagiste") navigate("/garage", { replace: true });
      else navigate("/app", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fadeIn" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border animate-slideIn" style={{ borderColor: 'var(--color-racine-200)' }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ background: 'linear-gradient(to right, var(--color-rouge-600), var(--color-rose-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Promoto
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--color-noir-600)' }}>Connectez-vous à votre compte</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 sm:py-3 rounded-lg border-2 outline-none transition-all duration-300 text-sm sm:text-base focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-rouge-500)';
                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-racine-200)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 sm:py-3 rounded-lg border-2 outline-none transition-all duration-300 text-sm sm:text-base focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-rouge-500)';
                e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-racine-200)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {error && (
            <div className="px-4 py-3 rounded-lg border text-sm sm:text-base" style={{ backgroundColor: 'var(--color-rouge-50)', borderColor: 'var(--color-rouge-200)', color: 'var(--color-rouge-700)' }}>
              {error}
            </div>
          )}
          
          <button
            disabled={loading}
            type="submit"
            className="w-full text-white font-semibold py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            style={{ background: loading ? 'var(--color-rouge-400)' : 'linear-gradient(to right, var(--color-rouge-600), var(--color-rose-600))' }}
          >
            <span className="relative z-10">{loading ? "Connexion..." : "Se connecter"}</span>
          </button>
          
          <div className="text-center text-xs sm:text-sm" style={{ color: 'var(--color-noir-600)' }}>
            Pas de compte ?{" "}
            <Link to="/register" className="font-semibold underline" style={{ color: 'var(--color-rouge-600)' }}>
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
