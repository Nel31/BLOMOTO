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
              Révolutionner l'avenir de la technologie et de l'innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Section Notre Histoire avec mise en page améliorée */}
      <section className="our-story-section bg-gray-50">
        <div className="container mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="fade-in-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Notre Histoire</h2>
              <div className="space-y-6 text-lg text-gray-700">
                <p>
                  Fondée en 2020, <span className="font-semibold text-blue-700">REVOLUTECH</span> a débuté avec une mission simple : combler le fossé entre la technologie de pointe et les utilisateurs quotidiens. Nos fondateurs, passionnés de technologie avec des années d'expérience, ont reconnu le besoin de solutions innovantes à la fois puissantes et accessibles.
                </p>
                <p>
                  Ce qui a commencé comme une petite startup s'est transformé en une entreprise dynamique à l'avant-garde de l'innovation technologique, avec une équipe de professionnels dévoués qui s'engagent à repousser les limites et à créer un changement significatif.
                </p>
              </div>
            </div>
            <div className="about-image fade-in-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-600 rounded-lg transform rotate-3"></div>
                <img src="/api/placeholder/600/400" alt="Équipe REVOLUTECH" className="rounded-lg shadow-lg relative z-10" />
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
              Chez REVOLUTECH, nous nous engageons à développer des technologies qui permettent aux individus et aux organisations d'atteindre leur plein potentiel. Nous croyons que l'innovation devrait être accessible à tous, et nous travaillons sans relâche pour créer des solutions à la fois puissantes et conviviales.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="mission-card p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 bg-white">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Innovation</h3>
              <p className="text-gray-600">Repousser constamment les limites et explorer de nouvelles possibilités technologiques.</p>
            </div>
            
            <div className="mission-card p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 bg-white">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Accessibilité</h3>
              <p className="text-gray-600">Rendre la technologie avancée accessible et utilisable par tous.</p>
            </div>
            
            <div className="mission-card p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 bg-white">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Durabilité</h3>
              <p className="text-gray-600">Créer des solutions qui sont non seulement efficaces mais aussi respectueuses de l'environnement.</p>
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
                    src={`/api/placeholder/300/300`} 
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à Révolutionner Votre Technologie?</h2>
            <p className="text-lg md:text-xl mb-12 opacity-90">
              Vous avez des questions ou souhaitez en savoir plus sur nos solutions? Notre équipe d'experts est là pour vous aider à transformer vos idées en réalité.
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-700 hover:bg-blue-100 font-bold py-4 px-8 rounded-lg transition duration-300 shadow-lg">
                Nous Contacter
              </button>
              <button className="bg-transparent hover:bg-blue-700 border-2 border-white text-white font-bold py-4 px-8 rounded-lg transition duration-300">
                En Savoir Plus
              </button>
            </div> */}
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