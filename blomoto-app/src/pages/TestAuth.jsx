import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function TestAuth() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const testLogin = (role) => {
    const testUsers = {
      admin: {
        id: 1,
        username: 'admin',
        email: 'admin@blomoto.com',
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User'
      },
      garagiste: {
        id: 2,
        username: 'garagiste',
        email: 'garagiste@blomoto.com',
        role: 'garagiste',
        first_name: 'Jean',
        last_name: 'Dupont'
      },
      client: {
        id: 3,
        username: 'client',
        email: 'client@blomoto.com',
        role: 'client',
        first_name: 'Marie',
        last_name: 'Martin'
      }
    };

    const user = testUsers[role];
    const token = `test_token_${role}_${Date.now()}`;
    
    login(user, token);
    
    // Rediriger vers le bon dashboard
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'garagiste') {
      navigate('/garagiste/dashboard');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Test d'authentification</h1>
        <p className="text-gray-600 text-center mb-8">
          Choisissez un rôle pour tester les différentes interfaces
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => testLogin('admin')}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Se connecter en tant qu'Admin
          </button>
          
          <button
            onClick={() => testLogin('garagiste')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter en tant que Garagiste
          </button>
          
          <button
            onClick={() => testLogin('client')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Se connecter en tant que Client
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export default TestAuth;
