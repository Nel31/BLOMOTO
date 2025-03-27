import React, { createContext, useContext, useState } from 'react';
import torento from "../assets/TORENTO.jpg";
import cars from "../assets/toyota.jpg";

const GarageContext = createContext();

export function GarageProvider({ children }) {
  const [garages] = useState([
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
    }
  ]);

  return (
    <GarageContext.Provider value={{ garages }}>
      {children}
    </GarageContext.Provider>
  );
}

export function useGarageContext() {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error('useGarageContext doit être utilisé à l\'intérieur d\'un GarageProvider');
  }
  return context;
} 