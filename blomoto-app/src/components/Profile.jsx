import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Building } from 'lucide-react';

/**
 * @typedef {Object} UserProfile
 * @property {string} username
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} phone
 * @property {string} created_at
 */

function Profile() {
  const [profile, setProfile] = useState(/** @type {UserProfile | null} */ (null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Non authentifié');
        }

        const response = await fetch('http://localhost:8000/user_app/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du profil');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* En-tête du profil */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-10">
            <div className="flex items-center">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
                <User size={48} className="text-blue-600" />
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-white">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="text-blue-100 mt-1">{profile?.username}</p>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <span>{profile?.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>Membre depuis: {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                <User size={20} />
                Modifier le profil
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2">
                <Building size={20} />
                Gérer mon garage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;