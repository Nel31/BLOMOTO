import React, { useState } from 'react';

function GarageList() {
  // Données fictives pour les garages
  const [garages, setGarages] = useState([
    {
      id: 1,
      name: "Garage Central Paris",
      address: "23 Avenue de la République, 75011 Paris",
      rating: 4.7,
      services: ["Réparation", "Entretien", "Diagnostic"],
      image: "https://via.placeholder.com/300x200"
    },
    {
      id: 2,
      name: "Auto Service Lyon",
      address: "56 Rue Garibaldi, 69003 Lyon",
      rating: 4.5,
      services: ["Réparation", "Carrosserie", "Pneus"],
      image: "https://via.placeholder.com/300x200"
    },
    {
      id: 3,
      name: "Mécanique Express Marseille",
      address: "122 Boulevard Baille, 13005 Marseille",
      rating: 4.8,
      services: ["Réparation", "Entretien", "Électronique"],
      image: "https://via.placeholder.com/300x200"
    },
    {
      id: 4,
      name: "Garage Technique Toulouse",
      address: "45 Avenue Jean Rieux, 31500 Toulouse", 
      rating: 4.6,
      services: ["Diagnostic", "Réparation", "Climatisation"],
      image: "https://via.placeholder.com/300x200"
    },
    {
      id: 5,
      name: "Auto Pro Bordeaux",
      address: "78 Cours Portal, 33000 Bordeaux",
      rating: 4.9,
      services: ["Toutes réparations", "Carrosserie", "Peinture"],
      image: "https://via.placeholder.com/300x200"
    }
  ]);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');

  // Liste de tous les services uniques
  const allServices = [...new Set(garages.flatMap(garage => garage.services))];

  // Filtrer les garages
  const filteredGarages = garages.filter(garage => {
    const matchesSearch = garage.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          garage.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === '' || garage.services.includes(selectedService);
    return matchesSearch && matchesService;
  });

  return (
    <section id="garage-list" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">Nos Garages Partenaires</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez notre réseau de garages de confiance, offrant des services de qualité pour l'entretien et la réparation de vos véhicules.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="md:w-2/3">
            <input
              type="text"
              placeholder="Rechercher par nom ou adresse..."
              className="w-full p-3 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-1/3">
            <select
              className="w-full p-3 border border-gray-300 rounded-md bg-white"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">Tous les services</option>
              {allServices.map((service, idx) => (
                <option key={idx} value={service}>{service}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des garages */}
        <div className="space-y-6">
          {filteredGarages.map(garage => (
            <div key={garage.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/4">
                <img src={garage.image} alt={garage.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-6 md:w-3/4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-dark">{garage.name}</h3>
                  <div className="bg-primary text-white px-2 py-1 rounded-md flex items-center">
                    <span className="mr-1">★</span> {garage.rating}
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{garage.address}</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {garage.services.map((service, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredGarages.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">Aucun garage ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default GarageList;