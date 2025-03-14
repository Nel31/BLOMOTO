import React from 'react';

function GetStarted() {
  const handleContact = () => {
    // Vous pouvez rediriger vers une page de contact ou ouvrir un formulaire
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Si aucune section contact n'existe, vous pourriez ouvrir un email
      window.location.href = 'mailto:info@revolutech.com';
    }
  };

  return (
    <section id="get-started" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-dark mb-6">
          Prêt à transformer votre entreprise ?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Contactez-nous dès aujourd'hui pour discuter de vos besoins et découvrir comment nos solutions peuvent vous aider à atteindre vos objectifs.
        </p>
        <button 
          className="bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition"
          onClick={handleContact}
        >
          Commencer maintenant
        </button>
      </div>
    </section>
  );
}

export default GetStarted;