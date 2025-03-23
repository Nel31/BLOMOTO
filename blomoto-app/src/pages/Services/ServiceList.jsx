import axios from 'axios';
import { ArrowLeft, ChevronDown, Search, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

function ServicesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedView, setExpandedView] = useState(false);
  const [isReturningFromGarageList, setIsReturningFromGarageList] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.SERVICES);
        setServices(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des services');
        setLoading(false);
        console.error('Erreur:', err);
      }
    };

    fetchServices();
  }, []);

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

  console.log("rerrrrrrr");
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

  const displayedServices = filteredServices.slice(0, 9);
  const hasMoreServices = 9 < filteredServices.length;

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
                      src={service.service_picture || "https://via.placeholder.com/400x300?text=Service"}
                      alt={service.name}
                      className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.comment}</p>
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
                        src={service.service_picture || "https://via.placeholder.com/400x300?text=Service"}
                        alt={service.name}
                        className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3 lg:w-3/4">
                    <h2 className="text-2xl font-bold text-[#0061FF] mb-4">
                      {service.name}
                    </h2>
                    <p className="text-gray-700 mb-6">{service.comment}</p>

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

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-600 mb-8">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
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
            </>
          )}
        </div>
      </div>
  );
}

export default ServicesList;