import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useNotifications } from "../hooks/useNotifications";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const setToken = useAuthStore((s) => s.setToken);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/app", { replace: true });
  };

  const isActive = (path: string) => {
    return location.pathname === `/admin${path}` || (path === "" && location.pathname === "/admin");
  };

  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <aside className="w-64 flex-shrink-0 border-r bg-white/90 backdrop-blur-md shadow-lg" style={{ borderColor: 'var(--color-racine-200)' }}>
        <div className="p-6 border-b relative" style={{ borderColor: 'var(--color-racine-200)' }}>
          <h3 className="text-2xl font-bold transition-all duration-300" style={{ background: 'linear-gradient(to right, var(--color-rouge-600), var(--color-rose-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Promoto
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>Espace Admin</p>
            {unreadCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
                title={`${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/admin"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/admin/garages"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("/garages") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/garages") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/garages") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            🏢 Garages
          </Link>
          <Link
            to="/admin/garagistes"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("/garagistes") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/garagistes") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/garagistes") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            👤 Garagistes
          </Link>
          <Link
            to="/admin/users"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("/users") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/users") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/users") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            👥 Utilisateurs
          </Link>
          <Link
            to="/admin/appointments"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("/appointments") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/appointments") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/appointments") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            📅 Rendez-vous
          </Link>
          <Link
            to="/admin/reviews"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("/reviews") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/reviews") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/reviews") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            ⭐ Avis
          </Link>
          <Link
            to="/admin/services"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("/services") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/services") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/services") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            🔧 Services
          </Link>
          <Link
            to="/admin/analytics"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("/analytics") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/analytics") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/analytics") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            📊 Analytics
          </Link>
          <Link
            to="/admin/messages"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 relative ${
              isActive("/messages") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/messages") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/messages") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            💬 Messages
          </Link>
          <Link
            to="/admin/invoices"
            className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${
              isActive("/invoices") ? "shadow-md" : "hover:bg-opacity-50"
            }`}
            style={{
              backgroundColor: isActive("/invoices") ? 'var(--color-rouge-600)' : 'transparent',
              color: isActive("/invoices") ? 'white' : 'var(--color-noir-700)'
            }}
          >
            🧾 Factures
          </Link>
          <button
            onClick={handleLogout}
            className="w-full mt-6 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
          >
            <span className="relative z-10">Déconnexion</span>
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
