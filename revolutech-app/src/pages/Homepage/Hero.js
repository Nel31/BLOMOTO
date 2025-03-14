import React from 'react';
import heroImage from '../../assets/2.jpeg';

function Hero() {
  const handleNavigation = (section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6">
              Transformez votre entreprise avec la technologie
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Solutions innovantes pour accélérer votre croissance et optimiser vos processus d'affaires.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                className="bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition"
                onClick={() => handleNavigation('services')}
              >
                Nos services
              </button>
              <button 
                className="border border-gray-300 text-dark px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition"
                onClick={() => handleNavigation('features')}
              >
                En savoir plus
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src={heroImage} 
              alt="Innovation technologique" 
              className="w-full rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;