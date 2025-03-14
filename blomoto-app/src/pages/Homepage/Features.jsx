import React from 'react';

function Features() {
  const features = [
    {
      icon: "💻",
      title: "Transformation Digitale",
      description: "Accompagnement sur mesure pour votre transition vers le numérique."
    },
    {
      icon: "🔒",
      title: "Cybersécurité",
      description: "Protection de vos données et systèmes contre les menaces."
    },
    {
      icon: "📊",
      title: "Analyse de Données",
      description: "Exploitation intelligente de vos données pour des décisions éclairées."
    },
    {
      icon: "🚀",
      title: "Innovation",
      description: "Développement de solutions technologiques adaptées à vos besoins."
    }
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">Nos Spécialités</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez comment nos solutions peuvent transformer votre entreprise et accélérer votre croissance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-dark mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;