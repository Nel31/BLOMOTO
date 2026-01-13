import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import GaragesPage from "./pages/GaragesPage";
import GaragistesPage from "./pages/GaragistesPage";
import { useAuthStore, UserRole } from "./store/auth";
import { api } from "./api/client";
import Layout from "./components/Layout";
import Header from "./components/Header";
import GarageDashboardPage from "./pages/GarageDashboardPage";
import UserHomePage from "./pages/UserHomePage";
import GarageSearchPage from "./pages/GarageSearchPage";
import GarageDetailPage from "./pages/GarageDetailPage";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import MessagesPage from "./pages/MessagesPage";
import GarageAppointmentsPage from "./pages/GarageAppointmentsPage";
import GarageServicesPage from "./pages/GarageServicesPage";
import GarageReviewsPage from "./pages/GarageReviewsPage";
import GarageSettingsPage from "./pages/GarageSettingsPage";
import GarageMessagesPage from "./pages/GarageMessagesPage";
import GarageQuotesPage from "./pages/GarageQuotesPage";
import GarageInvoicesPage from "./pages/GarageInvoicesPage";
import ClientQuotesPage from "./pages/ClientQuotesPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminServicesPage from "./pages/AdminServicesPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminGarageDetailPage from "./pages/AdminGarageDetailPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import AdminInvoicesPage from "./pages/AdminInvoicesPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((s) => !!s.token);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }: { children: JSX.Element; roles: UserRole[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const hydrate = async () => {
      if (token && !user) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
        } catch (e) {
          // ignore, user will be redirected to login by guards
        }
      }
    };
    hydrate();
  }, [token, user, setUser]);

  const roleRedirectPath = (r?: UserRole) => {
    if (r === "admin") return "/admin";
    if (r === "garagiste") return "/garage";
    return "/app";
  };

  return (
    <>
      <Header />
      <Routes>
        {/* Accueil: redirection selon l'état d'authentification et le rôle */}
        <Route
          path="/"
          element={
            token && user ? (
              <Navigate to={roleRedirectPath(user.role)} replace />
            ) : (
              <Navigate to="/app" replace />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Pages de callback FedaPay (publiques) */}
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-cancel" element={<PaymentCancelPage />} />
      {/* Espace Admin */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <RoleRoute roles={["admin"]}>
              <Layout />
            </RoleRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="garages" element={<GaragesPage />} />
        <Route path="garages/:id" element={<AdminGarageDetailPage />} />
        <Route path="garagistes" element={<GaragistesPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="invoices" element={<AdminInvoicesPage />} />
      </Route>

      {/* Espace Garagiste */}
      <Route
        path="/garage"
        element={
          <PrivateRoute>
            <RoleRoute roles={["garagiste"]}>
              <GarageDashboardPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/garage/appointments"
        element={
          <PrivateRoute>
            <RoleRoute roles={["garagiste"]}>
              <GarageAppointmentsPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/garage/services"
        element={
          <PrivateRoute>
            <RoleRoute roles={["garagiste"]}>
              <GarageServicesPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/garage/reviews"
        element={
          <PrivateRoute>
            <RoleRoute roles={["garagiste"]}>
              <GarageReviewsPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/garage/settings"
        element={
          <PrivateRoute>
            <RoleRoute roles={["garagiste"]}>
              <GarageSettingsPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/garage/messages"
        element={
          <PrivateRoute>
            <RoleRoute roles={["garagiste"]}>
              <GarageMessagesPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/garage/quotes"
        element={
          <PrivateRoute>
            <RoleRoute roles={["garagiste"]}>
              <GarageQuotesPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/garage/invoices"
        element={
          <PrivateRoute>
            <RoleRoute roles={["garagiste"]}>
              <GarageInvoicesPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Espace Client - Accessible à tous, avec fonctionnalités selon l'authentification */}
      <Route path="/app" element={<UserHomePage />} />
      <Route path="/app/garages" element={<GarageSearchPage />} />
      <Route path="/app/garage/:id" element={<GarageDetailPage />} />
      <Route
        path="/app/garage/:id/book"
        element={
          <PrivateRoute>
            <RoleRoute roles={["client"]}>
              <BookAppointmentPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/app/appointments"
        element={
          <PrivateRoute>
            <RoleRoute roles={["client"]}>
              <AppointmentsPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/app/profile"
        element={
          <PrivateRoute>
            <RoleRoute roles={["client"]}>
              <ProfilePage />
            </RoleRoute>
          </PrivateRoute>
        }
      />
              <Route
                path="/app/favorites"
                element={
                  <PrivateRoute>
                    <RoleRoute roles={["client"]}>
                      <FavoritesPage />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/app/quotes"
                element={
                  <PrivateRoute>
                    <RoleRoute roles={["client"]}>
                      <ClientQuotesPage />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
              <Route
                path="/app/messages"
                element={
                  <PrivateRoute>
                    <RoleRoute roles={["client", "garagiste"]}>
                      <MessagesPage />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
    </>
  );
}
