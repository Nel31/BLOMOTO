import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Wrench, ChevronDown, ArrowLeft } from 'lucide-react';

const services = [
  {
    id: 1,
    name: "Révision",
    image: "https://www.assuronline.com/wp-content/uploads/2022/02/64886295_l-scaled.jpg",
    details: [
      "Vidange",
      "Révision Intermédiaire (1 Filtre + Vidange huile moteur + Contrôles)",
      "Révision Générale (3 Filtres ou Bougies + Vidange huile moteur + Contrôles)",
      "Révision Constructeur (Suivi du carnet d'entretien avec garantie constructeur préservée)"
    ],
    description: "Découvrez nos différentes interventions d'entretien / révision pour votre voiture. Comparez les devis et prenez rdv en ligne pour votre entretien courant."
  },
  {
    id: 2,
    name: "Courroie de distribution",
    image: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80",
    details: [
      "Changement Courroie de distribution",
      "Changement Courroie d'accessoire",
      "Changement Poulie de vilebrequin / damper"
    ],
    description: "Assurez la fiabilité de votre moteur avec nos prestations de distribution pour votre voiture."
  },
  {
    id: 3,
    name: "Plaquettes de frein",
    image: "https://www.okey.fr/wp-content/uploads/2019/11/changer-plaquettes-de-frein.jpg",
    details: [
      "Changement Plaquettes de frein et Disques",
      "Remplacement Plaquettes",
      "Remplacement Disques",
      "Changement Kit de frein arrière - mâchoire ou tambour",
      "Remplacement Liquide de frein"
    ],
    description: "Pour votre sécurité au volant, le freinage de votre voiture doit être en parfait état de fonctionnement. Comparez les devis pour vos freins dans nos garages partenaires et roulez en toute sérénité !"
  },
  {
    id: 4,
    name: "Parallélisme",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80",
    details: [
      "Contrôle et réglage géométrie",
      "Équilibrage roues"
    ],
    description: "Pour une tenue de route optimale et une usure uniforme des pneus, faites régler le parallélisme de votre véhicule."
  },
  {
    id: 5,
    name: "Amortisseurs",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80",
    details: [
      "Remplacement amortisseurs avant",
      "Remplacement amortisseurs arrière",
      "Remplacement kit de suspension complet"
    ],
    description: "Des amortisseurs en bon état sont essentiels pour votre sécurité et votre confort de conduite."
  },
  {
    id: 6,
    name: "Vidange",
    image: "https://images.unsplash.com/photo-1492962827063-e5ea0d8c01f5?auto=format&fit=crop&w=800&q=80",
    details: [
      "Vidange huile moteur standard",
      "Vidange huile moteur longue durée",
      "Remplacement filtre à huile"
    ],
    description: "Une vidange régulière est indispensable pour préserver la santé de votre moteur."
  },
  {
    id: 7,
    name: "Embrayage",
    image: "https://cdn.prod.website-files.com/6413856d54d41b5f298d5953/642ec33ad58cc78a9f2ac756_9f6be7e21e6854da18d99b26b8325ec80f286671_arbre-transmission-automobile.jpeg",
    details: [
      "Remplacement kit embrayage",
      "Remplacement volant moteur",
      "Réglage embrayage"
    ],
    description: "Un embrayage défectueux peut causer des problèmes de transmission. Assurez-vous qu'il fonctionne correctement."
  },
  {
    id: 8,
    name: "Climatisation Voiture",
    image: "https://firstfroidclim.fr/wp-content/uploads/2022/03/reparateur-climatiseur-auto.jpg",
    details: [
      "Recharge climatisation",
      "Nettoyage circuit climatisation",
      "Remplacement filtre habitacle",
      "Réparation circuit climatisation"
    ],
    description: "Pour un confort optimal en toute saison, entretenez régulièrement votre système de climatisation."
  },
  {
    id: 9,
    name: "Décalaminage",
    image: "https://excellence-parebrise.com/wp-content/uploads/2023/06/car-engine-2021-08-27-11-27-27-utc-1024x683.jpg",
    details: [
      "Décalaminage moteur",
      "Nettoyage vanne EGR",
      "Nettoyage FAP/DPF"
    ],
    description: "Le décalaminage permet d'éliminer les dépôts de calamine qui affectent les performances de votre moteur."
  },
  {
    id: 10,
    name: "Diagnostics",
    image: "https://media.istockphoto.com/id/957612802/fr/vectoriel/condition-de-diagnostics-mat%C3%A9riel-de-voiture-scanner-test-contr%C3%B4le-analyse-v%C3%A9rification.jpg?s=612x612&w=0&k=20&c=kzEG6hFI6jld96bPFoS3yEDVdfDNF6HfDZivygK578k=",
    details: [
      "Diagnostic électronique",
      "Diagnostic panne moteur",
      "Contrôle pré-technique"
    ],
    description: "Un diagnostic précis est la première étape pour résoudre efficacement les problèmes de votre véhicule."
  },
  {
    id: 11,
    name: "Roues et direction",
    image: "https://paraisodopneu.pt/wp-content/uploads/2023/05/dsc04624-scaled.jpg",
    details: [
      "Changement Roulement de roue",
      "Changement Biellette de direction",
      "Changement Rotule de direction",
      "Réparation Pneu crevé",
      "Équilibrage Pneus",
      "Changement Pneus"
    ],
    description: "Découvrez nos différentes prestations sur les pneumatiques, les roues et la direction automobile."
  },
  {
    id: 12,
    name: "Démarrage et charge",
    image: "https://www.revue-technique-auto.fr/img/cms/Booster.jpg",
    details: [
      "Changement Batterie",
      "Changement Bougies d'allumage - voiture essence",
      "Changement Bougies de préchauffage - voiture diesel",
      "Changement Démarreur",
      "Changement Alternateur",
      "Contrôle Circuit de charge"
    ],
    description: "Confiez votre véhicule à nos garages partenaires pour prévenir les démarrages difficiles."
  },
  {
    id: 13,
    name: "Carrosserie et Vision",
    image: "https://wordpress-content.vroomly.com/wp-content/uploads/2023/03/quest-ce_que_carrosserie.jpg",
    details: [
      "Rénovation Pièce de Carrosserie",
      "Rénovation Optiques de phares",
      "Réparation Pare-brise",
      "Remplacement Pare-brise"
    ],
  },
  {
    id: 14,
    name: "Recherche de pannes",
    image: "https://www.transmico.com/wp-content/uploads/diagnostic-auto-opt-scaled.jpg",
    details: [
      "Recherche de Pannes"
    ],
    description: "Dans le cadre d'une recherche de panne, le garagiste effectue une examen visuel du véhicule et/ou un essai routier et établit un devis pour des réparations ou un diagnostic approfondi (problème de Freinage, problème de Distribution, problème de Moteur, Problème d’Embrayage, Problème de Suspension, Problème d’Échappement, Problème de Roues/Direction, Problème de Démarrage et Charge, Problème de Transmission."
  },
  {
    id: 14,
    name: "Dépannage",
    image: "https://central-depannage-auto.fr/images/truck.png",
    details: [
      "Dépannage"
    ],
    description: "Votre véhicule est en panne ? Besoin d'une assistance rapide et fiable ? Notre service de dépannage automobile est disponible 24h/24 et 7j/7 pour vous venir en aide où que vous soyez."
  }
];

function ServicesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleServices, setVisibleServices] = useState(9);
  const [expandedView, setExpandedView] = useState(false);
  const [isReturningFromGarageList, setIsReturningFromGarageList] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier si on revient de la page garage-list
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromGarage = params.get('fromGarage');
    if (fromGarage === 'true') {
      setIsReturningFromGarageList(true);
      // Nettoyer l'URL
      navigate('/services', { replace: true });
    }
  }, [location, navigate]);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceClick = (serviceId) => {
    // Ajouter un paramètre pour pouvoir revenir à cette page
    navigate(`/garage-list?service=${serviceId}&returnTo=services`);
  };
  
  const handleSeeMore = (e) => {
    e.preventDefault();
    setExpandedView(true);
  };

  const handleBackToGrid = () => {
    setExpandedView(false);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const displayedServices = filteredServices.slice(0, visibleServices);
  const hasMoreServices = visibleServices < filteredServices.length;

  // Vue principale avec les cartes
  const gridView = (
    <>
      {isReturningFromGarageList && (
        <div className="mb-6">
          <button 
            onClick={handleBackToHome}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour à l'accueil
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedServices.map((service) => (
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
    </>
  );

  // Vue détaillée verticale
  const listView = (
    <>
      <div className="mb-6">
        <button 
          onClick={handleBackToGrid}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à la vue par cartes
        </button>
      </div>
      
      <div className="space-y-16">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 lg:w-1/4">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="p-6 md:w-2/3 lg:w-3/4">
                <h2 className="text-2xl font-bold text-[#0061FF] mb-4">
                  Devis et prise de rendez-vous {service.name}
                </h2>
                <p className="text-gray-700 mb-6">{service.description}</p>
                
                <ul className="list-none space-y-2">
                  {service.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6">
                  <button
                    onClick={() => handleServiceClick(service.id)}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0089BD] transition-colors duration-200"
                  >
                    <Wrench size={20} />
                    Voir les garages pour {service.name}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center text-[#0061FF] mb-4">
          SERVICES
        </h1>
        
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          L'entretien de votre voiture devient simple et pas cher : Sur BLOMOTO, retrouvez l'ensemble des interventions disponibles pour votre voiture, comparez nos devis en réparation auto et validez votre rendez-vous en ligne auprès du garage automobile.
        </p>

        {!expandedView && (
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
        )}

        {expandedView ? listView : gridView}

        {!expandedView && hasMoreServices && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleSeeMore}
              className="group bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors duration-200"
            >
              Voir plus de services
              <ChevronDown className="group-hover:translate-y-1 transition-transform duration-200" size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesList;