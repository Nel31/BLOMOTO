import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Wrench, 
  Building2, 
  Calendar, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function AdminDashboardSimple() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Vue d'ensemble</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">1247</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Garages</p>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Services</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">RDV</p>
                    <p className="text-2xl font-bold text-gray-900">3421</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'appointments':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gestion des rendez-vous</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">Contenu des rendez-vous - Version simplifiée</p>
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-blue-800">✅ L'onglet Rendez-vous fonctionne !</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Contenu par défaut</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">Onglet: {activeTab}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Gestion de la plateforme</p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">Connecté en tant que {user?.first_name || 'Admin User'}</p>
          </div>
        </div>
        
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 hover:bg-gray-100 ${
              activeTab === 'overview' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <BarChart3 size={20} />
            <span>Vue d'ensemble</span>
          </button>
          
          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 hover:bg-gray-100 ${
              activeTab === 'appointments' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Calendar size={20} />
            <span>Rendez-vous</span>
          </button>
        </nav>
        
        <div className="mt-auto p-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminDashboardSimple;
