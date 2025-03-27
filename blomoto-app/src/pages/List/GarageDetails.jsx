import { Calendar, Clock, Home, MapPin, MessageSquare, Phone, Star, PenTool as Tool, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function GarageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garage, setGarage] = useState(null);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  useEffect(() => {
    // Ici, vous devrez implémenter la logique pour récupérer les données du garage
    // en utilisant l'ID de l'URL
    const fetchGarageDetails = async () => {
      try {
        // Exemple de données temporaires
        const mockGarage = {
          id: id,
          name: "Garage " + id,
          address: "123 rue Example",
          contact: "01 23 45 67 89",
          rating: 4.5,
          image: "https://example.com/garage.jpg",
          services: ["Diagnostic", "Réparation", "Entretien", "Vidange"]
        };
        setGarage(mockGarage);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du garage:", error);
        navigate('/garage-list');
      }
    };

    fetchGarageDetails();
  }, [id, navigate]);

  if (!garage) return <div>Chargement...</div>;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !phone || !appointmentDate || !selectedService) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    
    let confirmationMessage = `Rendez-vous pris pour ${clientName} le ${appointmentDate} pour le service ${selectedService}`;
    if (issueDescription) {
      confirmationMessage += `\nDescription de la panne: ${issueDescription}`;
    }
    
    alert(confirmationMessage);
    setClientName("");
    setPhone("");
    setAppointmentDate("");
    setSelectedService("");
    setIssueDescription("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate('/garage-list')} 
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à la liste des garages
          </button>
        </div>
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-96">
            <img
              src={garage.image}
              alt={garage.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-8 w-full">
                <h1 className="text-4xl font-bold text-white mb-2">{garage.name}</h1>
                <div className="flex items-center space-x-4 text-white">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{garage.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    <span>{garage.contact || "Non disponible"}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    <span>{garage.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Tool className="w-6 h-6 mr-2 text-blue-600" />
                Services disponibles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {garage.services.map((service, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    <span className="font-medium text-blue-900">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
                Avis clients
              </h2>
              <div className="space-y-4">
                {garage.reviews?.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="font-medium">Client {index + 1}</span>
                    </div>
                    <p className="text-gray-600">{review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Appointment Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                Prendre rendez-vous
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date du rendez-vous
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service souhaité
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionnez un service</option>
                    {garage.services.map((service, index) => (
                      <option key={index} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description de la panne (optionnel)
                  </label>
                  <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  Confirmer le rendez-vous
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarageDetails;