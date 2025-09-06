import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Wrench, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Edit,
  Eye,
  Phone,
  MapPin,
  Star,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function GaragisteDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Données simulées
  const garageInfo = {
    name: 'Garage Auto Plus',
    address: '123 Rue de la Paix, 75001 Paris',
    phone: '01 23 45 67 89',
    email: 'contact@garageautoplus.fr',
    rating: 4.8,
    totalAppointments: 156,
    completedAppointments: 142,
    pendingAppointments: 14
  };

  const todayAppointments = [
    { id: 1, client: 'Jean Dupont', service: 'Révision', time: '09:00', status: 'confirmed', phone: '06 12 34 56 78' },
    { id: 2, client: 'Marie Martin', service: 'Changement pneus', time: '10:30', status: 'pending', phone: '06 98 76 54 32' },
    { id: 3, client: 'Pierre Durand', service: 'Diagnostic', time: '14:00', status: 'confirmed', phone: '06 55 44 33 22' },
    { id: 4, client: 'Sophie Bernard', service: 'Réparation freins', time: '16:30', status: 'completed', phone: '06 11 22 33 44' }
  ];

  const services = [
    { id: 1, name: 'Révision complète', price: '120€', duration: '2h', active: true },
    { id: 2, name: 'Changement pneus', price: '80€', duration: '1h', active: true },
    { id: 3, name: 'Diagnostic électronique', price: '60€', duration: '30min', active: true },
    { id: 4, name: 'Réparation freins', price: '150€', duration: '3h', active: false }
  ];

  const clients = [
    { id: 1, name: 'Jean Dupont', email: 'jean@email.com', phone: '06 12 34 56 78', totalAppointments: 5, lastVisit: '2024-01-15', rating: 4.5 },
    { id: 2, name: 'Marie Martin', email: 'marie@email.com', phone: '06 98 76 54 32', totalAppointments: 3, lastVisit: '2024-01-10', rating: 5.0 },
    { id: 3, name: 'Pierre Durand', email: 'pierre@email.com', phone: '06 55 44 33 22', totalAppointments: 8, lastVisit: '2024-01-18', rating: 4.2 },
    { id: 4, name: 'Sophie Bernard', email: 'sophie@email.com', phone: '06 11 22 33 44', totalAppointments: 2, lastVisit: '2024-01-05', rating: 4.8 },
    { id: 5, name: 'Lucas Moreau', email: 'lucas@email.com', phone: '06 77 88 99 00', totalAppointments: 1, lastVisit: '2024-01-20', rating: 5.0 }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'appointments', name: 'Rendez-vous', icon: Calendar },
    { id: 'services', name: 'Mes services', icon: Wrench },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'settings', name: 'Paramètres', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Informations du garage */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{garageInfo.name}</h2>
          <div className="flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            <span className="text-lg font-semibold">{garageInfo.rating}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{garageInfo.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <span>{garageInfo.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>{garageInfo.email}</span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">RDV aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">RDV terminés</p>
              <p className="text-2xl font-bold text-gray-900">{garageInfo.completedAppointments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">RDV en attente</p>
              <p className="text-2xl font-bold text-gray-900">{garageInfo.pendingAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RDV d'aujourd'hui */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Rendez-vous d'aujourd'hui</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {todayAppointments.map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold text-gray-900">{appointment.time}</div>
                  <div>
                    <div className="font-medium">{appointment.client}</div>
                    <div className="text-sm text-gray-600">{appointment.service}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{appointment.phone}</span>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des rendez-vous</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} />
          Nouveau RDV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher un rendez-vous..."
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Tous les statuts</option>
              <option>Confirmé</option>
              <option>En attente</option>
              <option>Terminé</option>
              <option>Annulé</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {todayAppointments.map(appointment => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appointment.client}</div>
                      <div className="text-sm text-gray-500">{appointment.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes services</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} />
          Ajouter un service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{service.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {service.active ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Prix:</span>
                <span className="font-semibold">{service.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Durée:</span>
                <span className="font-semibold">{service.duration}</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Edit size={16} />
                Modifier
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Eye size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes clients</h2>
        <div className="flex gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>Tous les clients</option>
            <option>Clients fidèles (5+ RDV)</option>
            <option>Nouveaux clients</option>
            <option>Clients inactifs</option>
          </select>
        </div>
      </div>

      {/* Statistiques des clients */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">4.7</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">RDV ce mois</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clients fidèles</p>
              <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.totalAppointments >= 5).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un client..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              Filtres
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RDV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière visite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users size={20} className="text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.totalAppointments}</div>
                    <div className="text-xs text-gray-500">RDV total</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.lastVisit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{client.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        <Phone size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paramètres du garage</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du garage */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Informations du garage</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du garage</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={garageInfo.name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                defaultValue={garageInfo.address}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={garageInfo.phone}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={garageInfo.email}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horaires d'ouverture */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Horaires d'ouverture</h3>
          <div className="space-y-4">
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, index) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-20">{day}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    defaultValue={index < 5 ? "08:00" : index === 5 ? "09:00" : ""}
                    disabled={index === 6}
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="time"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    defaultValue={index < 5 ? "18:00" : index === 5 ? "17:00" : ""}
                    disabled={index === 6}
                  />
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600"
                    defaultChecked={index !== 6}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services proposés */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Services proposés</h3>
          <div className="space-y-3">
            {services.map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-500">{service.price} - {service.duration}</div>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600"
                  defaultChecked={service.active}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Paramètres de réservation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Paramètres de réservation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée minimum entre RDV (minutes)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Délai de réservation (jours)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="7"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacité maximale par jour</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="20"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Accepter les RDV en ligne</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Sauvegarder
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'appointments':
        return renderAppointments();
      case 'services':
        return renderServices();
      case 'clients':
        return renderClients();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Mon Garage</h1>
            <p className="text-gray-600">{garageInfo.name}</p>
            {user && (
              <p className="text-sm text-gray-500 mt-2">Connecté en tant que {user.first_name} {user.last_name}</p>
            )}
          </div>
          
          {/* Actions rapides */}
          <div className="p-4 border-b">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-700"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
          
          <nav className="mt-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default GaragisteDashboard;
