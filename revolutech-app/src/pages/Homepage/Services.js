import React from 'react';
import serviceImage from '../../assets/1.png';

function Services() {
  const services = [
    {
      title: "Conseil Technologique",
      description: "Notre expertise pour vous guider dans vos choix stratégiques."
    },
    {
      title: "Développement Logiciel",
      description: "Applications sur mesure adaptées à vos besoins spécifiques."
    },
    {
      title: "Intelligence Artificielle",
      description: "Intégration de l'IA pour automatiser et optimiser vos processus."
    },
    {
      title: "Cloud Computing",
      description: "Solutions cloud sécurisées pour une flexibilité maximale."
    }
  ];

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
            <h2 className="text-3xl font-bold text-dark mb-6">
              Services Professionnels
            </h2>
            <p className="text-gray-600 mb-8">
              Notre équipe d'experts délivre des solutions technologiques de haute qualité pour répondre aux défis de votre entreprise.
            </p>
            
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-dark mb-1">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:w-1/2">
            <img 
              src={serviceImage} 
              alt="Nos services professionnels" 
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;