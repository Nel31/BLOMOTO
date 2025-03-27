import React from "react";
import { useNavigate } from 'react-router-dom';
import { useGarageContext } from '../../context/GarageContext';

function GarageList() {
  const navigate = useNavigate();
  const { garages } = useGarageContext();

  const handleGarageSelect = (garage) => {
    navigate(`/garage/${garage.id}`);
  };

  return (
    <section id="garage-list" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Nos Garages Partenaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {garages.map((garage) => (
            <div
              key={garage.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleGarageSelect(garage)}
            >
              <div className="relative h-48">
                <img
                  src={garage.image}
                  alt={garage.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full">
                  {garage.rating} ★
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{garage.name}</h3>
                <p className="text-gray-600 mb-4">{garage.address}</p>
                <div className="flex flex-wrap gap-2">
                  {garage.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GarageList;
