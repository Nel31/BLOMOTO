import React from 'react';

const About = () => {
  return (
    <div className="about-container">
      {/* Section Héro avec fond dégradé */}
      <section className="hero-section bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">À Propos de <span className="text-blue-300">REVOLUTECH</span></h1>
            <p className="text-xl md:text-2xl mb-8 font-light">
              Révolutionner l'avenir de la mécanique automobile au Bénin
            </p>
          </div>
        </div>
      </section>

      {/* Section Notre Histoire avec mise en page améliorée */}
      <section className="our-story-section bg-gray-50">
        <div className="container mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="fade-in-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Qui sommes-nous?</h2>
              <div className="space-y-6 text-lg text-gray-700">
                <p>
                  Revolutech est né de la vision d'un groupe d'étudiants d'Epitech, réunis dans le cadre de notre projet de fin d'études (EIP – Innovation & Entrepreneuriat). Face aux nombreux défis auxquels notre pays, le Bénin, est confronté, nous avons décidé d'apporter une solution technologique concrète à un secteur essentiel mais souvent négligé : la mécanique automobile.
                </p>
                <p>
                  Nous avons constaté que de nombreux automobilistes rencontrent des difficultés pour accéder à des services de réparation fiables, rapides et transparents. De plus, les mécaniciens manquent souvent de visibilité et de ressources pour optimiser leur activité. C'est ainsi qu'est née notre initiative : créer une plateforme innovante qui connecte les propriétaires de véhicules aux professionnels de la mécanique, tout en intégrant des outils intelligents pour améliorer l'efficacité du secteur.
                </p>
                <p className="font-semibold text-blue-700">
                  Notre ambition est simple : révolutionner l'accès aux services de réparation automobile grâce à la technologie.
                </p>
              </div>
            </div>
            <div className="about-image fade-in-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-600 rounded-lg transform rotate-3"></div>
                <img 
                  src="https://images.unsplash.com/photo-1632823551722-5df4aa24a1d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                  alt="Équipe REVOLUTECH" 
                  className="rounded-lg shadow-lg relative z-10 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Notre Mission avec design moderne */}
      <section className="mission-section bg-white">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center max-w-3xl mx-auto fade-in">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">NOTRE VISION</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Notre Mission</h2>
            <p className="text-lg md:text-xl mb-12 text-gray-700">
              Chez Revolutech, notre mission est d'améliorer l'expérience de la mécanique automobile grâce à une solution digitale accessible et efficace.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <div className="mission-card p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 bg-white">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Faciliter l'accès</h3>
              <p className="text-gray-600">Mettre en relation les automobilistes avec des mécaniciens qualifiés proches de chez eux.</p>
            </div>
            
            <div className="mission-card p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 bg-white">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Optimiser la gestion</h3>
              <p className="text-gray-600">Fournir des outils technologiques pour une meilleure gestion des clients, stocks et interventions.</p>
            </div>
            
            <div className="mission-card p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 bg-white">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Renforcer la confiance</h3>
              <p className="text-gray-600">Assurer la transparence grâce aux évaluations, devis clairs et suivi en temps réel.</p>
            </div>

            <div className="mission-card p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 bg-white">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Encourager l'innovation</h3>
              <p className="text-gray-600">Intégrer des fonctionnalités avancées comme le diagnostic à distance et la gestion numérique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Équipe avec design moderne */}
      <section className="team-section bg-gray-50">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">NOTRE TALENT</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Une Équipe Passionnée</h2>
            <p className="text-lg max-w-3xl mx-auto text-gray-700">
              Nos experts dévoués travaillent ensemble pour apporter des solutions innovantes et accessibles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member group">
                <div className="relative overflow-hidden rounded-xl mb-6">
                  <img 
                    src={`https://source.unsplash.com/random/300x300?portrait&${index}`}
                    alt={member.name} 
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex space-x-3 justify-center">
                      <a href="#" className="hover:text-blue-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                      </a>
                      <a href="#" className="hover:text-blue-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Contact avec CTA amélioré */}
      <section className="contact-section bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à Révolutionner la Mécanique Automobile?</h2>
            <p className="text-lg md:text-xl mb-12 opacity-90">
              Rejoignez-nous dans notre mission de transformer le secteur automobile au Bénin. Ensemble, construisons une mécanique plus accessible, plus efficace et plus transparente.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Données des membres de l'équipe
const teamMembers = [
  {
    name: "ASSOUMA Afissou",
    position: "Développeur Full Stack",
    bio: "Expert en développement web et mobile avec une passion pour les solutions innovantes."
  },
  {
    name: "Soumaïla IDANI",
    position: "Architecte Logiciel",
    bio: "Spécialiste en conception d'architecture technique et optimisation des performances."
  },
  {
    name: "Ted DOSSOU-KOKO",
    position: "Responsable UI/UX",
    bio: "Créateur d'interfaces utilisateur intuitives et d'expériences digitales engageantes."
  },
  {
    name: "Ornel WHANNOU",
    position: "Ingénieur DevOps",
    bio: "Expert en déploiement continu et en automatisation des processus de développement."
  },
  {
    name: "Julia GOUDALO",
    position: "Cheffe de Projet",
    bio: "Coordonne efficacement les différentes phases du projet et assure une communication fluide."
  }
];

export default About;
