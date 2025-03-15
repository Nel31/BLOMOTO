import React, { useState } from "react";

function GarageDetails({ garage, onClose }) {
  if (!garage) return null;

  // États pour les champs du formulaire
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedService, setSelectedService] = useState("");

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !phone || !appointmentDate || !selectedService) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    alert(`Rendez-vous pris pour ${clientName} le ${appointmentDate} pour le service ${selectedService}`);
    
    // Réinitialisation du formulaire après soumission
    setClientName("");
    setPhone("");
    setAppointmentDate("");
    setSelectedService("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      {/* Image du garage */}
      <div className="relative w-full h-64 mb-4">
        <img
          src={garage.image}
          alt={garage.name}
          className="w-full h-full object-cover rounded-md shadow-lg"
        />
      </div>

      <h2 className="text-3xl font-bold text-blue-600">{garage.name}</h2>
      <p className="text-gray-600 mt-1"><strong>📍 Adresse:</strong> {garage.address}</p>
      <p className="text-gray-600 mt-1"><strong>📞 Contact:</strong> {garage.contact || "Non disponible"}</p>
      <p className="text-gray-600 mt-1"><strong>⭐ Note:</strong> {garage.rating} ★</p>

      {/* Services */}
      <h3 className="text-lg font-semibold mt-4">🔧 Services proposés:</h3>
      <ul className="list-disc pl-5 text-gray-700">
        {garage.services.map((service, index) => (
          <li key={index}>{service}</li>
        ))}
      </ul>

      {/* Avis */}
      <h3 className="text-lg font-semibold mt-4">🗣️ Avis des clients:</h3>
      <ul className="list-disc pl-5 text-gray-700">
        {garage.reviews?.map((review, index) => (
          <li key={index} className="italic">"{review}"</li>
        )) || <p>Aucun avis disponible</p>}
      </ul>

      {/* 📝 Formulaire de prise de rendez-vous */}
      <h3 className="text-lg font-semibold mt-6">📅 Prendre un rendez-vous :</h3>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Votre nom"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />
        <input
          type="tel"
          placeholder="Votre téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />
        <input
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md bg-white"
          required
        >
          <option value="">Choisissez un service</option>
          {garage.services.map((service, index) => (
            <option key={index} value={service}>{service}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition w-full"
        >
          Confirmer le rendez-vous
        </button>
      </form>

      {/* Bouton de retour */}
      <div className="mt-6 text-right">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          onClick={onClose}
        >
          Retour
        </button>
      </div>
    </div>
  );
}

export default GarageDetails;
