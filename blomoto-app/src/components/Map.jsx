import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useState } from 'react';
// import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibmVsMzEiLCJhIjoiY204bjc0bWJ1MDJyYTJpczVxZW81dXNmcyJ9.ELBCK7CT4kid8H9wRwVYMA';

const garages = [
  {
    id: 1,
    name: "Garage Central",
    latitude: 6.3702,
    longitude: 2.3912,
    rating: 4.5,
    address: "123 Rue du Commerce, Cotonou"
  },
  {
    id: 2,
    name: "Auto Service Plus",
    latitude: 6.3522,
    longitude: 2.4179,
    rating: 4.8,
    address: "45 Avenue Jean-Paul II, Cotonou"
  },
  {
    id: 3,
    name: "Mécanique Express",
    latitude: 6.3619,
    longitude: 2.4039,
    rating: 4.2,
    address: "78 Boulevard de la Marina, Cotonou"
  }
];

function MapComponent() {
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [viewState, setViewState] = useState({
    latitude: 6.3702,
    longitude: 2.3912,
    zoom: 12
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trouvez un garage près de chez vous</h2>
          <p className="text-xl text-gray-600">Découvrez les meilleurs garages partenaires dans votre région</p>
        </div>
        
        <div className="h-[600px] rounded-xl overflow-hidden shadow-xl">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            
            {garages.map(garage => (
              <Marker
                key={garage.id}
                latitude={garage.latitude}
                longitude={garage.longitude}
                anchor="bottom"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedGarage(garage);
                }}
              >
                <MapPin className="w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer" />
              </Marker>
            ))}

            {selectedGarage && (
              <Popup
                latitude={selectedGarage.latitude}
                longitude={selectedGarage.longitude}
                anchor="bottom"
                onClose={() => setSelectedGarage(null)}
                closeButton={true}
                closeOnClick={false}
                className="rounded-lg"
              >
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-1">{selectedGarage.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{selectedGarage.address}</p>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(selectedGarage.rating)
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
                        {selectedGarage.rating}/5
                      </span>
                    </div>
                  </div>
                  <button
                    className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={() => {/* Handle booking */}}
                  >
                    Prendre rendez-vous
                  </button>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </section>
  );
}

export default MapComponent;