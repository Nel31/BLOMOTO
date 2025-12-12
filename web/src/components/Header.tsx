import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../api/client";
import { useNotifications } from "../hooks/useNotifications";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = !!token && !!user;

  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    setIsClient(user?.role === "client");
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/garages?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    } else {
      navigate("/app/garages");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/app", { replace: true });
    setShowUserMenu(false);
  };

  // Ne pas afficher le header sur les pages admin/garagiste
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/garage")) {
    return null;
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b shadow-lg sticky top-0 z-50 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/app"
            className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
          >
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] bg-clip-text text-transparent group-hover:from-[var(--color-rouge-700)] group-hover:to-[var(--color-rose-700)] transition-all duration-300">
              Promoto
            </div>
          </Link>

          {/* Barre de recherche (visible sur certaines pages) */}
          {!location.pathname.includes("/login") && !location.pathname.includes("/register") && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un garage..."
                  className="w-full px-4 pl-10 py-2 rounded-lg border-2 outline-none transition-all text-sm"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--color-noir-400)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          )}

          {/* Navigation droite */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated && isClient ? (
              <>
                {/* Menu utilisateur */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-racine-50)] transition-colors relative"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      {unreadCount > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white"
                          style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>
                      {user?.name}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--color-noir-600)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2 z-50 animate-fadeIn backdrop-blur-sm" style={{ borderColor: 'var(--color-racine-200)' }}>
                        <Link
                          to="/app"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-[var(--color-racine-50)] transition-all duration-200 hover:translate-x-1 rounded-lg mx-2"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          🏠 Accueil
                        </Link>
                        <Link
                          to="/app/garages"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-[var(--color-racine-50)] transition-all duration-200 hover:translate-x-1 rounded-lg mx-2"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          🔍 Rechercher
                        </Link>
                        <Link
                          to="/app/appointments"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-[var(--color-racine-50)] transition-all duration-200 hover:translate-x-1 rounded-lg mx-2"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          📅 Mes rendez-vous
                        </Link>
                        <Link
                          to="/app/favorites"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-[var(--color-racine-50)] transition-all duration-200 hover:translate-x-1 rounded-lg mx-2"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          ❤️ Mes favoris
                        </Link>
                        <Link
                          to="/app/quotes"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-[var(--color-racine-50)] transition-all duration-200 hover:translate-x-1 rounded-lg mx-2"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          📄 Mes devis
                        </Link>
                        <Link
                          to="/app/messages"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-[var(--color-racine-50)] transition-all duration-200 hover:translate-x-1 rounded-lg mx-2 relative"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          <span className="flex items-center justify-between">
                            <span>💬 Messages</span>
                            {unreadCount > 0 && (
                              <span
                                className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center"
                                style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                              >
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </span>
                        </Link>
                        <Link
                          to="/app/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-[var(--color-racine-50)] transition-all duration-200 hover:translate-x-1 rounded-lg mx-2"
                          style={{ color: 'var(--color-noir-700)' }}
                        >
                          👤 Mon profil
                        </Link>
                        <div className="border-t my-2" style={{ borderColor: 'var(--color-racine-200)' }} />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-rouge-50)] transition-colors"
                          style={{ color: 'var(--color-rouge-600)' }}
                        >
                          Déconnexion
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
                  style={{ color: 'var(--color-noir-700)' }}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-sm hover:scale-105 active:scale-95"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

