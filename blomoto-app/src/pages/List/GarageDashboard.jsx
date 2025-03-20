import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, PenTool as Tool, MessageSquare, User, Phone, Clock, ChevronLeft, Check, X, Star, ThumbsUp } from 'lucide-react';

function GarageDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Simulated appointments data
    const mockAppointments = [
      {
        id: 1,
        clientName: "Jean Martin",
        phone: "+33 6 12 34 56 78",
        appointmentDate: "2024-03-20",
        selectedService: "Révision générale",
        issueDescription: "Bruit suspect au niveau du moteur. Le bruit est plus prononcé lors des accélérations et semble venir de l'avant du véhicule. J'ai aussi remarqué des vibrations inhabituelles au niveau du volant.",
        status: "completed",
        createdAt: "2024-03-15T10:30:00Z",
        clientFeedback: "Très satisfait du service. Le bruit a complètement disparu et la voiture roule beaucoup mieux maintenant.",
        rating: 5
      },
      {
        id: 2,
        clientName: "Sophie Dubois",
        phone: "+33 6 98 76 54 32",
        appointmentDate: "2024-03-22",
        selectedService: "Changement de pneus",
        issueDescription: "Les pneus sont très usés, surtout à l'avant. J'ai remarqué une perte d'adhérence sous la pluie. Le véhicule a environ 45000 km.",
        status: "confirmed",
        createdAt: "2024-03-15T14:20:00Z"
      }
    ];
    setAppointments(mockAppointments);
  }, [id]);

  const handleAppointmentAction = (appointmentId, action) => {
    setAppointments(prevAppointments =>
      prevAppointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: action }
          : appointment
      )
    );
  };

  // Calculer la satisfaction moyenne
  const completedAppointments = appointments.filter(app => app.status === 'completed' && app.rating);
  const averageRating = completedAppointments.length > 0
    ? (completedAppointments.reduce((acc, app) => acc + app.rating, 0) / completedAppointments.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord du Garage</h1>
            <p className="mt-2 text-gray-600">Gérez vos rendez-vous et demandes de service</p>
          </div>
          <button
            onClick={() => navigate('/garage-list')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Retour à la liste
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rendez-vous Total</p>
                <p className="text-2xl font-semibold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {appointments.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <Tool className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Services Demandés</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {[...new Set(appointments.map(app => app.selectedService))].length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <ThumbsUp className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction Client</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900 mr-2">{averageRating}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${
                          index < Math.round(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
              Demandes de Rendez-vous
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucun rendez-vous pour le moment
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{appointment.clientName}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Phone className="w-4 h-4 mr-2" />
                        {appointment.phone}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        {appointment.appointmentDate}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Tool className="w-4 h-4 mr-2" />
                        {appointment.selectedService}
                      </div>
                      
                      {/* Client Initial Request */}
                      <div className="mt-4 bg-yellow-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-yellow-800 mb-2">Description du problème :</h3>
                        <p className="text-sm text-yellow-900">{appointment.issueDescription || "Aucune description fournie"}</p>
                      </div>

                      {/* Client Post-Service Feedback */}
                      {appointment.status === 'completed' && appointment.clientFeedback && (
                        <div className="mt-4 bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-green-800">Retour client :</h3>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, index) => (
                                <Star
                                  key={index}
                                  className={`w-4 h-4 ${
                                    index < appointment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-green-900">{appointment.clientFeedback}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end space-y-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : appointment.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'pending' ? 'En attente' : 
                         appointment.status === 'confirmed' ? 'Confirmé' : 
                         appointment.status === 'rejected' ? 'Refusé' :
                         appointment.status === 'completed' ? 'Terminé' : 'Traité'}
                      </span>
                      
                      {appointment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accepter
                          </button>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarageDashboard;