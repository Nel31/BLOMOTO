// import React, { useState } from "react";
// import GarageDetails from "./GarageDetails";

// function GarageList() {
//   const garages = [
//     {
//       id: 1,
//       name: "AUTOSP",
//       address: "Camp Guezo, Carrefour, Cotonou",
//       rating: 4.7,
//       services: ["VIDANGE", "REVISION", "FREINAGE"],
//       contact: "+229 97 00 00 00",
//       reviews: ["Très bon service", "Rapide et efficace"],
//       image: "https://www.goafricaonline.com/media/cache/resolve/w800/uploads/media/user_profile_bg/0004/80/666efcccb954e-autosp-photo-centre-clean-recadre-e.jpeg",
//     },
//     {
//       id: 2,
//       name: "CFAO MOTORS",
//       address: "Cotonou, Carrefour Toyota",
//       rating: 4.5,
//       services: ["Réparation", "Carrosserie", "Pneus"],
//       contact: "+229 98 00 00 00",
//       reviews: ["Bon accueil", "Prix corrects"],
//       image: "https://media.licdn.com/dms/image/v2/D4E0BAQFAZoZY8wysLA/company-logo_200_200/company-logo_200_200/0/1726234498463/cfao_mobility_bj_logo",
//     },
//     {
//       id: 3,
//       name: "AUTOZONE",
//       address: "Cotonou, Akpakpa",
//       rating: 4.8,
//       services: ["Réparation", "Entretien", "Électronique"],
//       contact: "+229 99 00 00 00",
//       reviews: ["Service rapide", "Bon rapport qualité-prix"],
//       image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt7NmdT6-5n2qJfz0AJ8PPXrIfqoPEQwSn6Q&s",
//     },
//   ];

//   const [selectedGarage, setSelectedGarage] = useState(null);

//   return (
//     <section id="garage-list" className="py-16 bg-gray-50">
//       <div className="container mx-auto px-4">
//         {selectedGarage ? (
//           <GarageDetails garage={selectedGarage} onClose={() => setSelectedGarage(null)} />
//         ) : (
//           <>
//             <h2 className="text-3xl font-bold text-dark mb-4">Nos Garages Partenaires</h2>
//             <div className="space-y-6">
//               {garages.map((garage) => (
//                 <div key={garage.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
//                   <div className="md:w-1/4">
//                     <img src={garage.image} alt={garage.name} className="h-full w-full object-cover" />
//                   </div>
//                   <div className="p-6 md:w-3/4">
//                     <h3 className="text-xl font-bold text-dark">{garage.name}</h3>
//                     <p className="text-gray-600 mt-2">{garage.address}</p>
//                     <div className="mt-6 flex justify-end">
//                       <button
//                         className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
//                         onClick={() => setSelectedGarage(garage)}
//                       >
//                         Voir détails
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// }



import React, { useState } from "react";
import GarageDetails from "./GarageDetails";

function GarageList() {
  const garages = [
    {
      id: 1,
      name: "AUTOSP",
      address: "Camp Guezo, Carrefour, Cotonou",
      rating: 4.7,
      services: ["VIDANGE", "REVISION", "FREINAGE"],
      contact: "+229 97 00 00 00",
      reviews: ["Très bon service", "Rapide et efficace"],
      image: "https://www.goafricaonline.com/media/cache/resolve/w800/uploads/media/user_profile_bg/0004/80/666efcccb954e-autosp-photo-centre-clean-recadre-e.jpeg",
    },
    {
      id: 2,
      name: "CFAO MOTORS",
      address: "Cotonou, Carrefour Toyota",
      rating: 4.5,
      services: ["Réparation", "Carrosserie", "Pneus"],
      contact: "+229 98 00 00 00",
      reviews: ["Bon accueil", "Prix corrects"],
      image: "https://media.licdn.com/dms/image/v2/D4E0BAQFAZoZY8wysLA/company-logo_200_200/company-logo_200_200/0/1726234498463/cfao_mobility_bj_logo",
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
  ];

  const [selectedGarage, setSelectedGarage] = useState(null);

  return (
    <section id="garage-list" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {selectedGarage ? (
          <GarageDetails garage={selectedGarage} onClose={() => setSelectedGarage(null)} />
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
                      onClick={() => setSelectedGarage(garage)}
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




// export default GarageList;
/*
import { useState, useEffect } from "react";

export default function GarageRecommendations() {
  const [garages, setGarages] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/garages/")
      .then((response) => response.json())
      .then((data) => setGarages(data))
      .catch((error) => console.error("Error fetching garages:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Blo moto</h1>
        <button className="text-white">☰</button>
      </header>

      <div className="p-4">
        <input
          type="text"
          placeholder="Trouver un garage spécialisé"
          className="w-full p-2 border rounded-md"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 mt-2">
          <button className="bg-blue-500 text-white px-4 py-1 rounded">Réparations</button>
          <button className="bg-blue-500 text-white px-4 py-1 rounded">Mécanique</button>
          <button className="bg-blue-500 text-white px-4 py-1 rounded">Auto</button>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold">Nos recommandations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {garages
            .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
            .map((garage, index) => (
              <div key={index} className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold">{garage.name}</h3>
                <p>{garage.address}</p>
                <p className="text-sm text-gray-600">{garage.city}</p>
                <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">Voir plus</button>
              </div>
            ))}
        </div>
      </div>

      <footer className="bg-blue-500 text-white text-center p-4 mt-6">
        <p>Contact : +29 01 87 22222</p>
        <p>mail@globmoto.com - Québec, Canada</p>
        <p className="text-sm">Copyright ©2025 Blo moto. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
*/
