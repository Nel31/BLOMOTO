import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import torento from "../assets/TORENTO.jpg";
import cars from "../assets/toyota.jpg";
import GarageDetails from '../pages/List/GarageDetails';

// Coordonnées des garages de GarageList
const garages = [
  {
    id: 1,
    name: "AUTOSP",
    latitude: 6.3723,
    longitude: 2.3824,
    rating: 4.7,
    address: "Camp Guezo, Carrefour, Cotonou",
    services: ["VIDANGE", "REVISION", "FREINAGE"],
    contact: "+229 97 00 00 00",
    reviews: ["Très bon service", "Rapide et efficace"],
    image: "https://static.wixstatic.com/media/0fc404_ebef14f1549447ecb9acbdbe811515ac~mv2.jpg/v1/fit/w_1007,h_507,al_c,q_85/0fc404_ebef14f1549447ecb9acbdbe811515ac~mv2.jpg"
  },
  {
    id: 2,
    name: "CFAO MOTORS",
    latitude: 6.3575,
    longitude: 2.4123,
    rating: 4.5,
    address: "Cotonou, Carrefour Toyota",
    services: ["Réparation", "Carrosserie", "Pneus"],
    contact: "+229 98 00 00 00",
    reviews: ["Bon accueil", "Prix corrects"],
    image: cars
  },
  {
    id: 3,
    name: "AUTOZONE",
    latitude: 6.3651,
    longitude: 2.4002,
    rating: 4.8,
    address: "Cotonou, Akpakpa",
    services: ["Réparation", "Entretien", "Électronique"],
    contact: "+229 99 00 00 00",
    reviews: ["Service rapide", "Bon rapport qualité-prix"],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt7NmdT6-5n2qJfz0AJ8PPXrIfqoPEQwSn6Q&s"
  },
  {
    id: 4,
    name: "CARS MUSCLE",
    latitude: 6.3688,
    longitude: 2.3915,
    rating: 4.8,
    address: "Cotonou, saint-michel",
    services: ["Réparation", "Entretien", "Électronique"],
    contact: "+229 99 78 90 00",
    reviews: ["Service rapide", "Bon rapport qualité-prix"],
    image: torento
  },
  {
    id: 5,
    name: "GL MECANO",
    latitude: 6.3550,
    longitude: 2.3998,
    rating: 4.8,
    address: "CALAVI, SOS",
    services: ["Réparation", "Entretien", "Électronique"],
    contact: "+229 99 78 90 00",
    reviews: ["Service rapide", "Bon rapport qualité-prix"],
    image: "https://cdn0.toutcomment.com/fr/posts/1/0/4/apprendre_la_mecanique_auto_avec_un_livre_7401_2_600.jpg"
  },
  {
    id: 6,
    name: "CARS Drive MECO",
    latitude: 6.3620,
    longitude: 2.4050,
    rating: 4.8,
    address: "Cotonou, saint-michel",
    services: ["Réparation", "Entretien", "Électronique"],
    contact: "+229 99 78 90 00",
    reviews: ["Service rapide", "Bon rapport qualité-prix"],
    image: "https://c8.alamy.com/compfr/2bkgetb/logo-de-reparation-de-l-entretien-de-la-voiture-2bkgetb.jpg"
  }
];

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

function MapComponent() {
  const cotonouCenter = [6.3650, 2.3920];
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [searchParams] = useSearchParams();
  const garageId = searchParams.get('garageId');

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
    window.history.pushState({}, '', `?garageId=${garage.id}&fromMap=true`);
  };

  const handleClose = () => {
    setSelectedGarage(null);
    window.history.pushState({}, '', '/');
  };

  if (selectedGarage) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100">
        <GarageDetails garage={selectedGarage} onClose={handleClose} />
      </div>
    );
  }

  return (
    <section id="map-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trouvez un garage près de chez vous</h2>
          <p className="text-xl text-gray-600">Découvrez les meilleurs garages partenaires à Cotonou</p>
        </div>
        
        <div className="h-[600px] rounded-xl overflow-hidden shadow-xl">
          <MapContainer
            center={cotonouCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {garages.map(garage => (
              <Marker
                key={garage.id}
                position={[garage.latitude, garage.longitude]}
                icon={customIcon}
              >
                <Popup>
                  <div className="p-3">
                    <h3 className="font-bold text-lg mb-1">{garage.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{garage.address}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {garage.services.map((service, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(garage.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">
                          {garage.rating}/5
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{garage.contact}</p>
                    <button
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      onClick={() => handleGarageSelect(garage)}
                    >
                      <MapPin size={16} />
                      Prendre rendez-vous
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}

MapComponent.propTypes = {
  // Ajoutez ici les PropTypes si nécessaire
};

export default MapComponent;
