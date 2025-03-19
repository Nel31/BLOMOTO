import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, PenTool as Tool, MessageSquare, User, Phone, Clock, ChevronLeft } from 'lucide-react';

function GarageDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  // In a real app, fetch appointments from your backend
  useEffect(() => {
    // Simulated appointments data
    const mockAppointments = [
      {
        clientName: "Jean Martin",
        phone: "+33 6 12 34 56 78",
        appointmentDate: "2024-03-20",
        selectedService: "Révision générale",
        issueDescription: "Bruit suspect au niveau du moteur",
        status: "pending",
        createdAt: "2024-03-15T10:30:00Z"
      },
      {
        clientName: "Sophie Dubois",
        phone: "+33 6 98 76 54 32",
        appointmentDate: "2024-03-22",
        selectedService: "Changement de pneus",
        status: "confirmed",
        createdAt: "2024-03-15T14:20:00Z"
      }
    ];
    setAppointments(mockAppointments);
  }, [id]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              appointments.map((appointment, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
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
                      
                      {appointment.issueDescription && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">{appointment.issueDescription}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'pending' ? 'En attente' : 
                         appointment.status === 'confirmed' ? 'Confirmé' : 'Traité'}
                      </span>
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

export default GarageDashboard