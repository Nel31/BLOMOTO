import React, { useState } from 'react';
import logo from '../assets/2.jpeg';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (section) => {
    // Cette fonction permet de naviguer vers les différentes sections
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Fermer le menu mobile si ouvert
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="Revolutech Logo" className="h-10" onClick={() => handleNavigation('hero')} style={{ cursor: 'pointer' }} />
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li><a onClick={() => handleNavigation('hero')} className="font-medium text-primary cursor-pointer">Accueil</a></li>
            <li><a onClick={() => handleNavigation('services')} className="font-medium text-gray-600 hover:text-primary cursor-pointer">Services</a></li>
            <li><a onClick={() => handleNavigation('about')} className="font-medium text-gray-600 hover:text-primary cursor-pointer">À propos</a></li>
            <li><a onClick={() => handleNavigation('contact')} className="font-medium text-gray-600 hover:text-primary cursor-pointer">Contact</a></li>
          </ul>
        </nav>
        
        <div className="hidden md:block">
          <button 
            className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition"
            onClick={() => handleNavigation('get-started')}
          >
            Démarrer
          </button>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <ul className="flex flex-col space-y-4 p-4">
            <li><a onClick={() => handleNavigation('hero')} className="font-medium text-primary cursor-pointer">Accueil</a></li>
            <li><a onClick={() => handleNavigation('services')} className="font-medium text-gray-600 cursor-pointer">Services</a></li>
            <li><a onClick={() => handleNavigation('about')} className="font-medium text-gray-600 cursor-pointer">À propos</a></li>
            <li><a onClick={() => handleNavigation('contact')} className="font-medium text-gray-600 cursor-pointer">Contact</a></li>
            <li>
              <button 
                className="bg-primary text-white px-6 py-2 rounded-md font-medium w-full"
                onClick={() => handleNavigation('get-started')}
              >
                Démarrer
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default Header;