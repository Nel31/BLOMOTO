import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Diagnostic = () => {
  const [errors, setErrors] = useState([]);
  const [info, setInfo] = useState({});
  const location = useLocation();

  useEffect(() => {
    // Collecter les informations de diagnostic
    const diagnosticInfo = {
      currentPath: location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      localStorage: {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token'),
        user: localStorage.getItem('user')
      },
      sessionStorage: {
        keys: Object.keys(sessionStorage)
      }
    };

    setInfo(diagnosticInfo);

    // Vérifier les erreurs potentielles
    const errorList = [];
    
    // Vérifier si les tokens sont présents
    if (!localStorage.getItem('access_token')) {
      errorList.push('Aucun token d\'accès trouvé');
    }
    
    // Vérifier si l'utilisateur est défini
    if (!localStorage.getItem('user')) {
      errorList.push('Aucune information utilisateur trouvée');
    }

    setErrors(errorList);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Diagnostic de l'Application</h1>
        
        {/* Informations de base */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations de base</h2>
          <div className="space-y-2">
            <p><strong>Chemin actuel :</strong> {info.currentPath}</p>
            <p><strong>Timestamp :</strong> {info.timestamp}</p>
            <p><strong>User Agent :</strong> {info.userAgent}</p>
          </div>
        </div>

        {/* État de l'authentification */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">État de l'authentification</h2>
          <div className="space-y-2">
            <p><strong>Token d'accès :</strong> {info.localStorage?.access_token ? '✅ Présent' : '❌ Absent'}</p>
            <p><strong>Token de rafraîchissement :</strong> {info.localStorage?.refresh_token ? '✅ Présent' : '❌ Absent'}</p>
            <p><strong>Utilisateur :</strong> {info.localStorage?.user ? '✅ Présent' : '❌ Absent'}</p>
          </div>
        </div>

        {/* Erreurs détectées */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Erreurs détectées</h2>
          {errors.length > 0 ? (
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-red-600">❌ {error}</li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600">✅ Aucune erreur détectée</p>
          )}
        </div>

        {/* Actions de test */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Actions de test</h2>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
            >
              Aller à l'accueil
            </button>
            <button 
              onClick={() => window.location.href = '/test'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4"
            >
              Tester la page de test
            </button>
            <button 
              onClick={() => window.location.href = '/test-auth'}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mr-4"
            >
              Tester l'authentification
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Vider le localStorage et recharger
            </button>
          </div>
        </div>

        {/* Informations de debug */}
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">Informations de debug (JSON)</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
