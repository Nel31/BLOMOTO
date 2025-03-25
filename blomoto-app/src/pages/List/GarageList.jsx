import React, { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import torento from "../../assets/TORENTO.jpg";
import cars from "../../assets/toyota.jpg";
import GarageDetails from "./GarageDetails";

function GarageList() {
  const [searchParams] = useSearchParams();
  const garageId = searchParams.get('garageId');
  
  const garages = [
    {
      id: 1,
      name: "AUTOSP",
      address: "Camp Guezo, Carrefour, Cotonou",
      rating: 4.7,
      services: ["VIDANGE", "REVISION", "FREINAGE"],
      contact: "+229 97 00 00 00",
      reviews: ["Très bon service", "Rapide et efficace"],
      image: "https://static.wixstatic.com/media/0fc404_ebef14f1549447ecb9acbdbe811515ac~mv2.jpg/v1/fit/w_1007,h_507,al_c,q_85/0fc404_ebef14f1549447ecb9acbdbe811515ac~mv2.jpg",
    },
    {
      id: 2,
      name: "CFAO MOTORS",
      address: "Cotonou, Carrefour Toyota",
      rating: 4.5,
      services: ["Réparation", "Carrosserie", "Pneus"],
      contact: "+229 98 00 00 00",
      reviews: ["Bon accueil", "Prix corrects"],
      image: cars,
    },
    {
      id: 3,
      name: "AUTOZONE",
      address: "Cotonou, Akpakpa",
      rating: 4.8,
      services: ["Réparation", "Entretien", "Électronique"],
      contact: "+229 99 00 00 00",
      reviews: ["Service rapide", "Bon rapport qualité-prix"],
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt7NmdT6-5n2qJfz0AJ8PPXrIfqoPEQwSn6Q&s",
    },
    {
      id: 4,
      name: "CARS MUSCLE",
      address: "Cotonou, saint-michel",
      rating: 4.8,
      services: ["Réparation", "Entretien", "Électronique"],
      contact: "+229 99 78 90 00",
      reviews: ["Service rapide", "Bon rapport qualité-prix"],
      image: torento,
    },
    {
      id: 5,
      name: "GL MECANO",
      address: "CALAVI, SOS",
      rating: 4.8,
      services: ["Réparation", "Entretien", "Électronique"],
      contact: "+229 99 78 90 00",
      reviews: ["Service rapide", "Bon rapport qualité-prix"],
      image: "https://cdn0.toutcomment.com/fr/posts/1/0/4/apprendre_la_mecanique_auto_avec_un_livre_7401_2_600.jpg",
    },
    {
      id: 6,
      name: "CARS Drive MECO",
      address: "Cotonou, saint-michel",
      rating: 4.8,
      services: ["Réparation", "Entretien", "Électronique"],
      contact: "+229 99 78 90 00",
      reviews: ["Service rapide", "Bon rapport qualité-prix"],
      image: "https://c8.alamy.com/compfr/2bkgetb/logo-de-reparation-de-l-entretien-de-la-voiture-2bkgetb.jpg",
    },
  ];

  const [selectedGarage, setSelectedGarage] = useState(null);

  useEffect(() => {
    if (garageId) {
      const garage = garages.find(g => g.id === parseInt(garageId));
      if (garage) {
        setSelectedGarage(garage);
      }
    }
  }, [garageId]);

  const handleGarageSelect = (garage) => {
    setSelectedGarage(garage);
    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({}, '', `?garageId=${garage.id}`);
  };

  const handleClose = () => {
    setSelectedGarage(null);
    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({}, '', '/');
  };

  return (
    <section id="garage-list" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {selectedGarage ? (
          <GarageDetails garage={selectedGarage} onClose={handleClose} />
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center text-dark mb-12">Nos Garages Partenaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {garages.map((garage) => (
                <div key={garage.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src={garage.image} 
                    alt={garage.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{garage.name}</h3>
                    <p className="text-gray-600 mb-4">{garage.address}</p>
                    <button
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
                      onClick={() => handleGarageSelect(garage)}
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default GarageList;
