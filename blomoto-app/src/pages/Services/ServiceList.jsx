import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    id: 1,
    name: "Réparations mécaniques",
    description: "Moteur, freins, transmission et plus encore.",
    image: "https://images.unsplash.com/photo-1487754160018-137d527c34e7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Entretien courant",
    description: "Vidange, filtres, contrôle technique",
    image: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Dépannage rapide",
    description: "Assistance en cas de panne",
    image: "https://images.unsplash.com/photo-1617886337523-53c5f39ae546?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "Pneumatiques",
    description: "Changement, équilibrage, géométrie",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"
  }
];

function ServicesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);
  const navigate = useNavigate();

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedServices = showAllServices ? filteredServices : filteredServices.slice(0, 4);

  const handleServiceClick = (serviceId) => {
    navigate(`/garage-list?service=${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-[#00C2CB] mb-4">Services</h1>
        
        <p className="text-center text-gray-600 mb-8">
          Avec Blo moto, localise des garages pros près de chez toi, découvre des services adaptés et profite de tarifs transparents.
        </p>

        <div className="flex justify-center mb-12">
          <div className="w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un garage, un service..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-32"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#00C2CB] text-white px-6 py-2 rounded-lg">
                Rechercher
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button
                  onClick={() => handleServiceClick(service.id)}
                  className="bg-[#00C2CB] text-white px-6 py-2 rounded-lg w-full hover:bg-[#00a9b1] transition-colors"
                >
                  Voir les garages
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length > 4 && !showAllServices && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAllServices(true)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Voir plus de services
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesList;
