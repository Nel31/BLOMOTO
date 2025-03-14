import React from 'react';

function Testimonials() {
  const testimonials = [
    {
      quote: "Revolutech a transformé nos processus métier grâce à leur solution innovante. Nous avons augmenté notre productivité de 40%.",
      author: "Marie Dupont",
      position: "Directrice Générale, TechCorp",
      avatar: "https://via.placeholder.com/60"
    },
    {
      quote: "L'équipe de Revolutech a fait preuve d'un professionnalisme exemplaire. Leur accompagnement nous a permis de mener à bien notre transformation digitale.",
      author: "Jean Martin",
      position: "CTO, InnovSoft",
      avatar: "https://via.placeholder.com/60"
    },
    {
      quote: "Nous avons été impressionnés par la qualité des solutions proposées et par l'expertise technique de l'équipe. Nous les recommandons vivement.",
      author: "Sophie Bernard",
      position: "Responsable IT, GroupeABC",
      avatar: "https://via.placeholder.com/60"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">Ce que nos clients disent</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les témoignages de nos clients qui ont fait confiance à nos solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow">
              <div className="text-gray-600 italic mb-4">"{testimonial.quote}"</div>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-dark">{testimonial.author}</div>
                  <div className="text-gray-500 text-sm">{testimonial.position}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
