import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

function GarageDetails({ garage, onClose }) {
  if (!garage) return null;

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !phone || !appointmentDate || !selectedService) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    alert(`Rendez-vous pris pour ${clientName} le ${appointmentDate} pour le service ${selectedService}`);
    setClientName("");
    setPhone("");
    setAppointmentDate("");
    setSelectedService("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        {/* Image du garage */}
        <div className="relative w-full h-80 mb-6">
          <img
            src={garage.image}
            alt={garage.name}
            className="w-full h-full object-cover rounded-md shadow-lg"
          />
        </div>
    {/*<p className="text-gray-600 mt-2 text-center"><strong>📍 Adresse:</strong> {garage.address}</p>
    <p className="text-gray-600 mt-1 text-center"><strong>📞 Contact:</strong> {garage.contact || "Non disponible"}</p>
    <p className="text-gray-600 mt-1 text-center"><strong>⭐ Note:</strong> {garage.rating} ★</p> */}

    {/* Services */}
    <h3 className="text-2xl font-semibold mt-6">🔧 Services:</h3>
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {garage.services.map((service, index) => (
        <li key={index} className="bg-gray-200 p-4 rounded-md text-center">{service}</li>
      ))}
    </ul>

    {/* Avis */}
    <h3 className="text-2xl font-semibold mt-6">🗣️ Avis des clients:</h3>
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-md shadow">
        <FaUserCircle className="w-12 h-12 text-gray-400" />
        <div>
          <p className="font-semibold">Jean Dupont</p>
          <p className="text-yellow-500">★★★★☆</p>
          <p className="italic text-gray-600">"Excellent service et accueil chaleureux !"</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-md shadow">
        <FaUserCircle className="w-12 h-12 text-gray-400" />
        <div>
          <p className="font-semibold">Marie Curie</p>
          <p className="text-yellow-500">★★★★★</p>
          <p className="italic text-gray-600">"Rapide et efficace, je recommande vivement !"</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-md shadow">
        <FaUserCircle className="w-12 h-12 text-gray-400" />
        <div>
          <p className="font-semibold">Albert Einstein</p>
          <p className="text-yellow-500">★★★☆☆</p>
          <p className="italic text-gray-600">"Bon travail mais un peu d'attente."</p>
        </div>
      </div>
    </div>

    {/* 📝 Formulaire de prise de rendez-vous */}
    <h3 className="text-2xl font-semibold mt-6">📅 Prendre un rendez-vous :</h3>
    <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Votre nom"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        className="p-3 border border-gray-300 rounded-md w-full"
        required
      />
      <input
        type="tel"
        placeholder="Votre téléphone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="p-3 border border-gray-300 rounded-md w-full"
        required
      />
      <input
        type="date"
        value={appointmentDate}
        onChange={(e) => setAppointmentDate(e.target.value)}
        className="p-3 border border-gray-300 rounded-md w-full"
        required
      />
      <select
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
        className="p-3 border border-gray-300 rounded-md w-full bg-white"
        required
      >
        <option value="">Choisissez un service</option>
        {garage.services.map((service, index) => (
          <option key={index} value={service}>{service}</option>
        ))}
      </select>
      <button
        type="submit"
        className="col-span-1 md:col-span-2 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition w-full"
      >
        Confirmer le rendez-vous
      </button>
    </form>

    {/* Bouton de retour */}
    <div className="mt-6 text-center">
      <button
        className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition w-full md:w-auto"
        onClick={onClose}
      >
        Retour
      </button>
    </div>
  </div>
</div>
);
}

export default GarageDetails
