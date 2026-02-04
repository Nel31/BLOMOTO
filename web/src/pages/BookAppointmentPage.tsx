import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth";
import ImageUpload from "../components/ImageUpload/ImageUpload";
import PaymentForm from "../components/Payment/PaymentForm";
import FedapayButton from "../components/Payment/FedapayButton";

interface Garage {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  duration?: number;
}

export default function BookAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user);

  const [garage, setGarage] = useState<Garage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Formulaire
  const [selectedService, setSelectedService] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [vehicleBrand, setVehicleBrand] = useState<string>("");
  const [vehicleModel, setVehicleModel] = useState<string>("");
  const [vehicleYear, setVehicleYear] = useState<string>("");
  const [vehicleLicensePlate, setVehicleLicensePlate] = useState<string>("");
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'fedapay'>('fedapay');
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  // Horaires disponibles (9h-18h, par créneaux de 30min)
  const timeSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  useEffect(() => {
    // Rediriger si non connecté
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    // Vérifier que c'est un client
    if (user && user.role !== "client") {
      navigate("/app", { replace: true });
      return;
    }

    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Charger le garage
        const garageRes = await api.get(`/garages/${id}`);
        setGarage(garageRes.data.garage);

        // Charger les services
        const servicesRes = await api.get(`/services/garage/${id}`);
        setServices(servicesRes.data.services || []);

        if (servicesRes.data.services && servicesRes.data.services.length > 0) {
          setSelectedService(servicesRes.data.services[0]._id);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isAuthenticated, user, navigate]);

  // Date minimale = aujourd'hui
  const minDate = new Date().toISOString().split("T")[0];
  // Date maximale = dans 3 mois
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !date || !time) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const appointmentData: any = {
        garageId: id,
        serviceId: selectedService,
        date: new Date(date).toISOString(),
        time,
        status: "pending",
      };

      if (notes) appointmentData.notes = notes;

      // Ajouter les infos véhicule si au moins une est remplie
      if (vehicleBrand || vehicleModel || vehicleYear || vehicleLicensePlate || vehiclePhotos.length > 0) {
        appointmentData.vehicleInfo = {};
        if (vehicleBrand) appointmentData.vehicleInfo.brand = vehicleBrand;
        if (vehicleModel) appointmentData.vehicleInfo.model = vehicleModel;
        if (vehicleYear) appointmentData.vehicleInfo.year = parseInt(vehicleYear);
        if (vehicleLicensePlate) appointmentData.vehicleInfo.licensePlate = vehicleLicensePlate;
        if (vehiclePhotos.length > 0) appointmentData.vehicleInfo.photos = vehiclePhotos;
      }

      const res = await api.post("/appointments", appointmentData);
      const newAppointment = res.data.appointment;

      // Si le service a un prix, proposer le paiement
      if (selectedServiceData?.price && selectedServiceData.price > 0) {
        setCreatedAppointment(newAppointment);
        setShowPayment(true);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate("/app/appointments", { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la réservation");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || (user && user.role !== "client")) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="text-base" style={{ color: 'var(--color-noir-700)' }}>Chargement...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border text-center max-w-md" style={{ borderColor: 'var(--color-racine-200)' }}>
          <div className="w-16 h-16 bg-[var(--color-rouge-100)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" style={{ color: 'var(--color-rouge-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>Réservation confirmée !</h2>
          <p className="text-base mb-4" style={{ color: 'var(--color-noir-600)' }}>
            Votre rendez-vous a été enregistré avec succès.
          </p>
          <p className="text-sm" style={{ color: 'var(--color-noir-500)' }}>
            Redirection vers vos rendez-vous...
          </p>
        </div>
      </div>
    );
  }

  if (error && !garage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-md border text-center max-w-md" style={{ borderColor: 'var(--color-racine-200)' }}>
          <p className="text-base mb-4" style={{ color: 'var(--color-noir-700)' }}>
            {error}
          </p>
          <button
            onClick={() => navigate("/app/garages")}
            className="px-6 py-2.5 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const selectedServiceData = services.find((s) => s._id === selectedService);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-racine-50), white, var(--color-rose-50))' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(`/app/garage/${id}`)}
          className="mb-6 flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: 'var(--color-noir-600)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux détails du garage
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-noir)' }}>
          Réserver un rendez-vous
        </h1>
        {garage && (
          <p className="text-base mb-6" style={{ color: 'var(--color-noir-600)' }}>
            Pour {garage.name} - {garage.address.city}
          </p>
        )}

        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-2xl border animate-fadeIn" style={{ borderColor: 'var(--color-racine-200)' }}>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base mb-4" style={{ color: 'var(--color-noir-600)' }}>
                Aucun service disponible pour ce garage.
              </p>
              <Link
                to={`/app/garage/${id}`}
                className="inline-block px-6 py-2.5 bg-[var(--color-rouge-600)] hover:bg-[var(--color-rouge-700)] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Retour
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection du service */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Service * <span className="text-xs font-normal text-[var(--color-noir-500)]">(obligatoire)</span>
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                >
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name} - {(service.price || 0).toLocaleString()} XOF {service.duration && `(${service.duration} min)`}
                    </option>
                  ))}
                </select>
                {selectedServiceData && (
                  <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-racine-50)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-noir-700)' }}>
                      {selectedServiceData.category}
                    </p>
                    {selectedServiceData.description && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-noir-600)' }}>
                        {selectedServiceData.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Date et heure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Date * <span className="text-xs font-normal text-[var(--color-noir-500)]">(obligatoire)</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={minDate}
                    max={maxDateStr}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                    Heure * <span className="text-xs font-normal text-[var(--color-noir-500)]">(obligatoire)</span>
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                  >
                    <option value="">Sélectionner une heure</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-noir-700)' }}>
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Décrivez brièvement le problème ou les informations supplémentaires..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all text-sm resize-none"
                  style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                />
              </div>

              {/* Informations véhicule (optionnel) */}
              <div>
                <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--color-noir-700)' }}>
                  Informations du véhicule (optionnel)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-noir-600)' }}>
                      Marque
                    </label>
                    <input
                      type="text"
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      placeholder="Ex: Peugeot"
                      className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all text-sm"
                      style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-noir-600)' }}>
                      Modèle
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Ex: 308"
                      className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all text-sm"
                      style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-noir-600)' }}>
                      Année
                    </label>
                    <input
                      type="number"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      placeholder="Ex: 2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all text-sm"
                      style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-noir-600)' }}>
                      Plaque d'immatriculation
                    </label>
                    <input
                      type="text"
                      value={vehicleLicensePlate}
                      onChange={(e) => setVehicleLicensePlate(e.target.value.toUpperCase())}
                      placeholder="Ex: AB-123-CD"
                      className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-all text-sm"
                      style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir)', backgroundColor: 'white' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-rose-500)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--color-racine-200)'}
                    />
                  </div>
                </div>

                {/* Photos du véhicule */}
                <div className="mt-4">
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-noir-600)' }}>
                    Photos du véhicule (optionnel)
                  </label>
                  <ImageUpload
                    onUploadComplete={(urls) => setVehiclePhotos(urls)}
                    maxImages={5}
                    folder="vehicles"
                    multiple={true}
                    label="Ajouter des photos"
                  />
                </div>
              </div>

              {showPayment && createdAppointment && selectedServiceData?.price ? (
                <div className="border-t pt-6" style={{ borderColor: 'var(--color-racine-200)' }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
                      Méthode de paiement
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="fedapay"
                          checked={paymentMethod === 'fedapay'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'fedapay' | 'stripe')}
                          className="w-4 h-4"
                          style={{ accentColor: 'var(--color-racine-600)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--color-noir-700)' }}>FedaPay (Mobile Money)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={paymentMethod === 'stripe'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'fedapay' | 'stripe')}
                          className="w-4 h-4"
                          style={{ accentColor: 'var(--color-racine-600)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--color-noir-700)' }}>Stripe (Carte bancaire)</span>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'stripe' ? (
                    <PaymentForm
                      appointmentId={createdAppointment._id}
                      amount={selectedServiceData.price}
                      onSuccess={() => {
                        setSuccess(true);
                        setTimeout(() => {
                          navigate("/app/appointments", { replace: true });
                        }, 2000);
                      }}
                      onCancel={() => {
                        setShowPayment(false);
                        setSuccess(true);
                        setTimeout(() => {
                          navigate("/app/appointments", { replace: true });
                        }, 2000);
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-racine-50 rounded-lg">
                        <p className="text-sm mb-2" style={{ color: 'var(--color-noir-700)' }}>
                          <strong>Montant à payer:</strong> {selectedServiceData.price.toLocaleString()} XOF
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-noir-600)' }}>
                          Vous serez redirigé vers la page de paiement FedaPay
                        </p>
                      </div>
                      <FedapayButton
                        appointmentId={createdAppointment._id}
                        amount={selectedServiceData.price}
                        currency="XOF"
                        onSuccess={() => {
                          console.log('Paiement FedaPay initié');
                        }}
                        onError={(error) => {
                          alert(`Erreur: ${error}`);
                        }}
                        buttonText={`Payer ${selectedServiceData.price.toLocaleString()} XOF avec FedaPay`}
                      />
                      <button
                        onClick={() => {
                          setShowPayment(false);
                        }}
                        className="w-full px-4 py-2 border-2 rounded-lg text-sm font-semibold transition-all duration-200"
                        style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir-700)' }}
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-racine-200)' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-rouge-600)] to-[var(--color-rose-600)] hover:from-[var(--color-rouge-700)] hover:to-[var(--color-rose-700)] text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                  >
                    <span className="relative z-10">{submitting ? "Réservation en cours..." : "Confirmer la réservation"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/garage/${id}`)}
                    className="px-6 py-3 border-2 font-semibold rounded-lg transition-all duration-300"
                    style={{ borderColor: 'var(--color-racine-200)', color: 'var(--color-noir-700)' }}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

