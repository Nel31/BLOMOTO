import React from 'react';
import { Link } from 'react-router-dom';

const TestNavigation = () => {
  const testRoutes = [
    { path: '/', name: 'Accueil', description: 'Page d\'accueil principale' },
    { path: '/test', name: 'Test Simple', description: 'Page de test basique' },
    { path: '/test-auth', name: 'Test Auth', description: 'Page de test d\'authentification' },
    { path: '/diagnostic', name: 'Diagnostic', description: 'Page de diagnostic complet' },
    { path: '/about', name: 'À propos', description: 'Page à propos' },
    { path: '/contact', name: 'Contact', description: 'Page de contact' },
    { path: '/login', name: 'Connexion', description: 'Page de connexion' },
    { path: '/register', name: 'Inscription', description: 'Page d\'inscription' },
    { path: '/garage-list', name: 'Liste Garages', description: 'Liste des garages' },
    { path: '/service-list', name: 'Liste Services', description: 'Liste des services' },
    { path: '/admin/dashboard', name: 'Admin Dashboard', description: 'Tableau de bord admin' },
    { path: '/garagiste/dashboard', name: 'Garagiste Dashboard', description: 'Tableau de bord garagiste' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Navigation de Test</h2>
      <p className="text-gray-600 mb-6">
        Cliquez sur les liens ci-dessous pour tester chaque page. 
        Si une page est blanche, cela indique un problème avec ce composant spécifique.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testRoutes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <h3 className="font-semibold text-gray-800">{route.name}</h3>
            <p className="text-sm text-gray-600">{route.description}</p>
            <p className="text-xs text-blue-500 mt-1">{route.path}</p>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions de test :</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Cliquez sur chaque lien pour tester la page</li>
          <li>2. Si une page est blanche, notez laquelle</li>
          <li>3. Ouvrez la console du navigateur (F12) pour voir les erreurs</li>
          <li>4. Utilisez la page Diagnostic pour plus d'informations</li>
        </ol>
      </div>
    </div>
  );
};

export default TestNavigation;
