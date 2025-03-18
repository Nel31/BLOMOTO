import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wrench } from 'lucide-react';

const services = [
  {
    id: 1,
    name: "Révision",
    image: "https://www.assuronline.com/wp-content/uploads/2022/02/64886295_l-scaled.jpg"
  },
  {
    id: 2,
    name: "Courroie de distribution",
    image: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Plaquettes de frein",
    image: "https://www.okey.fr/wp-content/uploads/2019/11/changer-plaquettes-de-frein.jpg"
  },
  {
    id: 4,
    name: "Parallélisme",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    name: "Amortisseurs",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    name: "Vidange",
    image: "https://images.unsplash.com/photo-1492962827063-e5ea0d8c01f5?auto=format&fit=crop&w=800&q=80"
  }
];

function ServicesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceClick = (serviceId) => {
    navigate(`/garage-list?service=${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center text-[#0061FF] mb-4">
          SERVICES
        </h1>
        
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          L'entretien de votre voiture devient simple et pas cher : Sur BLOMOTO, retrouvez l'ensemble des interventions disponibles pour votre voiture, comparez nos devis en réparation auto et validez votre rendez-vous en ligne auprès du garage automobile.
        </p>

        <div className="flex justify-center mb-12">
          <div className="w-full max-w-2xl relative">
            <input
              type="text"
              placeholder="Rechercher une prestation..."
              className="w-full px-6 py-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#00A5E3] focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.name}</h3>
                <button
                  onClick={() => handleServiceClick(service.id)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0089BD] transition-colors duration-200"
                >
                  <Wrench size={20} />
                  Voir les garages
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServicesList;