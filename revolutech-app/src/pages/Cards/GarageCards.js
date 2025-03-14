import React from 'react';

function GarageCards() {
  // Données fictives pour les garages
  const garages = [
    {
      id: 1,
      name: "Garage Central Paris",
      description: "Service premium d'entretien automobile dans le cœur de Paris.",
      image: "https://via.placeholder.com/400x300",
      services: ["Réparation", "Entretien", "Diagnostic"],
      rating: 4.7,
      reviews: 124
    },
    {
      id: 2,
      name: "Auto Service Lyon",
      description: "Experts en réparation automobile et carrosserie depuis plus de 20 ans.",
      image: "https://via.placeholder.com/400x300",
      services: ["Réparation", "Carrosserie", "Pneus"],
      rating: 4.5,
      reviews: 89
    },
    {
      id: 3,
      name: "Mécanique Express Marseille",
      description: "Service rapide et efficace pour tous types de véhicules.",
      image: "https://via.placeholder.com/400x300",
      services: ["Réparation", "Entretien", "Électronique"],
      rating: 4.8,
      reviews: 156
    },
    {
      id: 4,
      name: "Garage Technique Toulouse",
      description: "Spécialiste en diagnostic et réparation de systèmes électroniques.",
      image: "https://via.placeholder.com/400x300",
      services: ["Diagnostic", "Réparation", "Climatisation"],
      rating: 4.6,
      reviews: 72
    },
    {
      id: 5,
      name: "Auto Pro Bordeaux",
      description: "Solutions complètes pour l'entretien et la réparation de votre véhicule.",
      image: "https://via.placeholder.com/400x300",
      services: ["Toutes réparations", "Carrosserie", "Peinture"],
      rating: 4.9,
      reviews: 203
    },
    {
      id: 6,
      name: "Mécanique Générale Nantes",
      description: "Service professionnel pour tous les problèmes mécaniques.",
      image: "https://via.placeholder.com/400x300",
      services: ["Mécanique générale", "Freinage", "Suspensions"],
      rating: 4.7,
      reviews: 118
    }
  ];

  return (
    <section id="garage-cards" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">Découvrez Nos Garages Partenaires</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Un réseau de professionnels qualifiés pour tous vos besoins automobiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {garages.map(garage => (
            <div key={garage.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
              <div className="h-48 overflow-hidden">
                <img 
                  src={garage.image} 
                  alt={garage.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-dark">{garage.name}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-gray-700">{garage.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {garage.reviews} avis
                </p>
                <p className="text-gray-600 mb-4">{garage.description}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {garage.services.map((service, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-700 transition mt-2">
                  Contacter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GarageCards;