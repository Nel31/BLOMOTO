import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/user_app/users/1/`)
      .then((response) => {
        setUser(response.data);
        setFormData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement de l'utilisateur :", error);
        setError("Impossible de charger les données.");
        setLoading(false);
      });
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://127.0.0.1:8000/user_app/users/1/`, formData)
      .then((response) => {
        setUser(response.data);
        setEditMode(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour :", error);
        setError("Impossible de mettre à jour les données.");
      });
  };

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-center text-gray-800">
          Profil de {user.username}
        </h2>
        <img
          src={user.profile_picture ? `http://127.0.0.1:8000${user.profile_picture}` : "/default_avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mt-4"
        />
        
        {!editMode ? (
          <div className="text-gray-700 mt-4">
            <p><strong>Nom :</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Téléphone :</strong> {user.phone_number || "Non renseigné"}</p>
            <p><strong>Date de naissance :</strong> {user.birth_date || "Non renseignée"}</p>
            <button 
              onClick={() => setEditMode(true)} 
              className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Modifier le profil
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              name="first_name"
              value={formData.first_name || ""}
              onChange={handleChange}
              placeholder="Prénom"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="last_name"
              value={formData.last_name || ""}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number || ""}
              onChange={handleChange}
              placeholder="Téléphone"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex justify-between mt-4">
              <button 
                type="submit" 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Enregistrer
              </button>
              <button 
                type="button" 
                onClick={() => setEditMode(false)} 
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
