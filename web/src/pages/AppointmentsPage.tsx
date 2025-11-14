import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth";
import ChatWindow from "../components/Chat/ChatWindow";

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
  };
  garageId: {
    _id: string;
    name: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
    };
    phone: string;
  };
  serviceId: {
    _id: string;
    name: string;
    category: string;
    price: number;
  };
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showChat, setShowChat] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [chatAppointmentId, setChatAppointmentId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (user && user.role !== "client") {
      navigate("/app", { replace: true });
      return;
    }

    loadAppointments();
  }, [isAuthenticated, user, navigate]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/appointments/client/me");
      setAppointments(res.data.appointments || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      return;
    }

    try {
      await api.put(`/appointments/${id}`, { status: "cancelled" });
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const openReviewModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setReviewRating(5);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedAppointment) return;

    if (!reviewComment.trim()) {
      alert("Veuillez écrire un commentaire");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        garageId: selectedAppointment.garageId._id,
        rating: reviewRating,
        comment: reviewComment,
        appointmentId: selectedAppointment._id,
      });
      
      alert("Votre avis a été publié avec succès !");
      setShowReviewModal(false);
      setSelectedAppointment(null);
      setReviewRating(5);
      setReviewComment("");
      loadAppointments(); // Recharger pour mettre à jour l'état
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la publication de l'avis");
    } finally {
      setSubmittingReview(false);
    }
  };

  const openChatWithGarage = async (garageId: string, appointmentId: string) => {
    try {
      // Récupérer les détails du garage pour obtenir l'ID du propriétaire
      const garageRes = await api.get(`/garages/${garageId}`);
      const garage = garageRes.data.garage;
      
      if (garage && garage.ownerId) {
        setChatUserId(garage.ownerId._id || garage.ownerId);
        setChatAppointmentId(appointmentId);
        setShowChat(true);
      } else {
        alert("Impossible de contacter le garagiste");
      }
    } catch (err: any) {
      console.error("Erreur lors de l'ouverture du chat:", err);
      alert("Erreur lors de l'ouverture du chat");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "var(--color-racine-100)", text: "var(--color-racine-700)", label: "En attente" };
      case "confirmed":
        return { bg: "var(--color-rose-100)", text: "var(--color-rose-700)", label: "Confirmé" };
      case "in-progress":
        return { bg: "var(--color-rouge-100)", text: "var(--color-rouge-700)", label: "En cours" };
      case "completed":
        return { bg: "var(--color-noir-200)", text: "var(--color-noir-700)", label: "Terminé" };
      case "cancelled":
        return { bg: "var(--color-noir-300)", text: "var(--color-noir-600)", label: "Annulé" };
      default:
        return { bg: "var(--color-noir-200)", text: "var(--color-noir-600)", label: status };
    }
  };

  const now = new Date();
  const upcoming = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    return aptDate >= now && apt.status !== "cancelled" && apt.status !== "completed";
  });
  const past = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    return aptDate < now || apt.status === "cancelled" || apt.status === "completed";
  });

  const displayAppointments = activeTab === "upcoming" ? upcoming : past;

  if (!isAuthenticated || (user && user.role !== "client")) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
              Mes rendez-vous
            </h1>
            <p className="text-base" style={{ color: 'var(--color-noir-600)' }}>
              Gérez vos rendez-vous avec les garages
            </p>
          </div>
          <Link
            to="/app/garages"
            className="px-6 py-2.5 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            + Nouveau rendez-vous
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border mb-6 animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--color-racine-200)' }}>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                activeTab === "upcoming" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "upcoming" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "upcoming" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              À venir ({upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                activeTab === "past" ? "border-b-2" : ""
              }`}
              style={{
                color: activeTab === "past" ? 'var(--color-rouge-600)' : 'var(--color-noir-600)',
                borderBottomColor: activeTab === "past" ? 'var(--color-rouge-600)' : 'transparent',
              }}
            >
              Passés ({past.length})
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
              </div>
            ) : displayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-noir-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-base mb-4" style={{ color: 'var(--color-noir-600)' }}>
                  {activeTab === "upcoming" 
                    ? "Aucun rendez-vous à venir" 
                    : "Aucun rendez-vous passé"}
                </p>
                {activeTab === "upcoming" && (
                  <Link
                    to="/app/garages"
                    className="inline-block px-6 py-2.5 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Réserver un rendez-vous
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayAppointments.map((apt) => {
                  const statusColors = getStatusColor(apt.status);
                  const aptDate = new Date(apt.date);
                  const canCancel = apt.status === "pending" || apt.status === "confirmed";

                  return (
                    <div
                      key={apt._id}
                      className="bg-white/50 rounded-xl p-5 sm:p-6 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
                      style={{ borderColor: 'var(--color-racine-200)' }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: 'var(--color-noir)' }}>
                                {apt.garageId.name}
                              </h3>
                              <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                                {apt.garageId.address.street}, {apt.garageId.address.city}
                              </p>
                            </div>
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                              style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                            >
                              {statusColors.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5" style={{ color: 'var(--color-rouge-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>
                                {aptDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5" style={{ color: 'var(--color-rose-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>
                                {apt.time}
                              </span>
                            </div>
                          </div>

                          <div className="bg-[var(--color-racine-50)] rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold" style={{ color: 'var(--color-noir-700)' }}>
                                {apt.serviceId.name}
                              </span>
                              <span className="text-base font-bold" style={{ color: 'var(--color-rouge-600)' }}>
                                {apt.serviceId.price}€
                              </span>
                            </div>
                            <span className="text-xs uppercase" style={{ color: 'var(--color-racine-600)' }}>
                              {apt.serviceId.category}
                            </span>
                          </div>

                          {apt.vehicleInfo && (apt.vehicleInfo.brand || apt.vehicleInfo.model || apt.vehicleInfo.licensePlate) && (
                            <div className="text-xs mb-2" style={{ color: 'var(--color-noir-600)' }}>
                              <span className="font-medium">Véhicule: </span>
                              {[apt.vehicleInfo.brand, apt.vehicleInfo.model, apt.vehicleInfo.year, apt.vehicleInfo.licensePlate]
                                .filter(Boolean)
                                .join(" • ")}
                            </div>
                          )}

                          {apt.notes && (
                            <p className="text-sm italic mt-2" style={{ color: 'var(--color-noir-600)' }}>
                              "{apt.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => openChatWithGarage(apt.garageId._id, apt._id)}
                            className="px-4 py-2 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white rounded-lg text-sm font-semibold transition-all duration-200 text-center shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
                          >
                            💬 Contacter le garagiste
                          </button>
                          {canCancel && (
                            <button
                              onClick={() => cancelAppointment(apt._id)}
                              className="px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-all duration-200"
                              style={{ borderColor: 'var(--color-rouge-600)', color: 'var(--color-rouge-600)' }}
                            >
                              Annuler
                            </button>
                          )}
                          <Link
                            to={`/app/garage/${apt.garageId._id}`}
                            className="px-4 py-2 bg-[var(--color-racine-600)] hover:bg-[var(--color-racine-700)] text-white rounded-lg text-sm font-semibold transition-all duration-200 text-center"
                          >
                            Voir le garage
                          </Link>
                          {apt.status === "completed" && (
                            <button
                              onClick={() => openReviewModal(apt)}
                              className="px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-all duration-200 text-center"
                              style={{ borderColor: 'var(--color-rose-600)', color: 'var(--color-rose-600)' }}
                            >
                              ⭐ Laisser un avis
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && chatUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowChat(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-racine-200)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-noir)' }}>Chat avec le garagiste</h3>
              <button
                onClick={() => setShowChat(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--color-noir-600)' }}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <ChatWindow
                userId={chatUserId}
                appointmentId={chatAppointmentId || undefined}
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-racine-200)' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
                Laisser un avis
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-noir-600)' }}>
                Partagez votre expérience avec {selectedAppointment.garageId.name}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Note */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-noir-700)' }}>
                  Note *
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-4xl transition-transform hover:scale-110"
                      style={{ color: star <= reviewRating ? '#fbbf24' : '#d1d5db' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs mt-2" style={{ color: 'var(--color-noir-600)' }}>
                  {reviewRating === 5 ? "Excellent" : reviewRating === 4 ? "Très bien" : reviewRating === 3 ? "Bien" : reviewRating === 2 ? "Moyen" : "Mauvais"}
                </p>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Commentaire *
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Décrivez votre expérience avec ce garage..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border-2 outline-none resize-none transition-all"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t flex gap-3" style={{ borderColor: 'var(--color-racine-200)' }}>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedAppointment(null);
                  setReviewRating(5);
                  setReviewComment("");
                }}
                className="flex-1 px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-all"
                style={{ borderColor: 'var(--color-racine-300)', color: 'var(--color-noir-700)' }}
              >
                Annuler
              </button>
              <button
                onClick={submitReview}
                disabled={submittingReview || !reviewComment.trim()}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-rose-600)', color: 'white' }}
              >
                {submittingReview ? "Publication..." : "Publier l'avis"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

