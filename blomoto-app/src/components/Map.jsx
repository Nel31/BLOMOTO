import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import torento from "../assets/TORENTO.jpg";
import cars from "../assets/toyota.jpg";

// Styles CSS pour les marqueurs
const markerStyles = {
  marker: {
    backgroundImage: 'url(https://docs.mapbox.com/help/demos/custom-markers-gl-js/mapbox-icon.png)',
    backgroundSize: 'cover',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    cursor: 'pointer',
    border: '2px solid white',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)'
  }
};

// Coordonnées des garages
const garages = [
  {
    id: 1,
    name: "AUTOSP",
    coordinates: [2.3824, 6.3723],
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
    coordinates: [2.4123, 6.3575],
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
    coordinates: [2.4002, 6.3651],
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
    coordinates: [2.3915, 6.3688],
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
    coordinates: [2.3998, 6.3550],
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
    coordinates: [2.4050, 6.3620],
    rating: 4.8,
    address: "Cotonou, saint-michel",
    services: ["Réparation", "Entretien", "Électronique"],
    contact: "+229 99 78 90 00",
    reviews: ["Service rapide", "Bon rapport qualité-prix"],
    image: "https://c8.alamy.com/compfr/2bkgetb/logo-de-reparation-de-l-entretien-de-la-voiture-2bkgetb.jpg"
  }
];

function MapComponent() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Fonction pour calculer la distance entre deux points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fonction pour trouver le garage le plus proche
  const findNearestGarage = (userLat, userLon) => {
    let nearestGarage = garages[0];
    let minDistance = Infinity;

    garages.forEach(garage => {
      const distance = calculateDistance(
        userLat,
        userLon,
        garage.coordinates[1],
        garage.coordinates[0]
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestGarage = garage;
      }
    });

    return nearestGarage;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.3824, 6.3723], // Cotonou coordinates (position par défaut)
      zoom: 12
    });

    // Ajout du contrôle de géolocalisation
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });

    mapRef.current.addControl(geolocateControl);

    // Écouter l'événement de géolocalisation
    geolocateControl.on('geolocate', (e) => {
      const { longitude, latitude } = e.coords;
      
      // Trouver le garage le plus proche
      const nearestGarage = findNearestGarage(latitude, longitude);
      
      // Créer les bounds pour inclure la position de l'utilisateur et le garage le plus proche
      const bounds = new mapboxgl.LngLatBounds()
        .extend([longitude, latitude])
        .extend(nearestGarage.coordinates);

      // Ajouter un padding pour une meilleure visualisation
      const padding = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      };

      // Ajuster le zoom en fonction de la distance
      const distance = calculateDistance(
        latitude,
        longitude,
        nearestGarage.coordinates[1],
        nearestGarage.coordinates[0]
      );

      // Calculer le zoom en fonction de la distance
      let zoom = 14; // Zoom par défaut
      if (distance > 10) zoom = 12;
      if (distance > 20) zoom = 11;
      if (distance > 30) zoom = 10;

      mapRef.current.fitBounds(bounds, {
        padding,
        maxZoom: zoom
      });
    });

    mapRef.current.on('load', () => {
      // Add markers for each garage
      garages.forEach(garage => {
        const el = document.createElement('div');
        el.className = 'marker';
        Object.assign(el.style, markerStyles.marker);

        new mapboxgl.Marker(el)
          .setLngLat(garage.coordinates)
          .setPopup(
            new mapboxgl.Popup({ 
              offset: 25,
              closeButton: true,
              closeOnClick: false,
              className: 'custom-popup'
            })
              .setHTML(`
                <div class="p-3">
                  <h3 class="font-bold text-lg mb-1">${garage.name}</h3>
                  <p class="text-gray-600 text-sm mb-2">${garage.address}</p>
                  <div class="flex flex-wrap gap-1 mb-2">
                    ${garage.services.map(service => `
                      <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        ${service}
                      </span>
                    `).join('')}
                  </div>
                  <div class="flex items-center mb-3">
                    <div class="flex items-center">
                      ${[...Array(5)].map((_, i) => `
                        <svg class="w-4 h-4 ${i < Math.floor(garage.rating) ? 'text-yellow-400' : 'text-gray-300'}"
                             fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      `).join('')}
                      <span class="ml-1 text-sm text-gray-600">${garage.rating}/5</span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 mb-3">${garage.contact}</p>
                  <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                          onclick="window.location.href='/garage/${garage.id}'">
                    Prendre rendez-vous
                  </button>
                </div>
              `)
          )
          .addTo(mapRef.current);
      });

      // Lancer la géolocalisation dès que la carte est chargée
      geolocateControl.trigger();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [navigate]);

  return (
    <section id="map-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trouvez un garage près de chez vous</h2>
          <p className="text-xl text-gray-600">Découvrez les meilleurs garages partenaires à Cotonou</p>
        </div>
        
        <div className="h-[600px] rounded-xl overflow-hidden shadow-xl">
          <div
            ref={mapContainerRef}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>
    </section>
  );
}

export default MapComponent;