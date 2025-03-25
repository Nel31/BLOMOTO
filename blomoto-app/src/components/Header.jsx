import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import tikTok from '../assets/3.webp';
import insta from '../assets/images.png';
import face from '../assets/face.avif';
import { Phone, Mail, Globe, MessageCircle } from 'lucide-react';
import logo from '../assets/5.png';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>

      
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-14 w-auto" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link 
                  to="/" 
                  className={`font-medium text-xl ${isActive('/') ? 'text-black font-semibold' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/service-list" 
                  className={`font-medium text-xl ${isActive('/service-list') ? 'text-black font-semibold' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/garage-list" 
                  className={`font-medium text-xl ${isActive('/garage-list') ? 'text-black font-semibold' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Garages
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`font-medium text-xl ${isActive('/about') ? 'text-black font-semibold' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`font-medium text-xl ${isActive('/contact') ? 'text-black font-semibold' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`font-medium text-xl ${isActive('/login') ? 'text-black font-semibold' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Mon compte
                </Link>
              </li>
              <li>
                <Link 
                  to="/garage/1/dashboard" 
                  className={`font-medium text-xl ${isActive('/garage/1/dashboard') ? 'text-black font-semibold' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Tableau de bord
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <ul className="flex flex-col space-y-4 p-4">
              <li>
                <Link 
                  to="/" 
                  className={`block font-medium text-lg py-2 px-3 rounded-md ${isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-blue-600'} hover:bg-blue-50 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/service-list" 
                  className={`block font-medium text-lg py-2 px-3 rounded-md ${isActive('/service-list') ? 'bg-blue-50 text-blue-700' : 'text-blue-600'} hover:bg-blue-50 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/garage-list" 
                  className={`block font-medium text-lg py-2 px-3 rounded-md ${isActive('/garage-list') ? 'bg-blue-50 text-blue-700' : 'text-blue-600'} hover:bg-blue-50 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Garages
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`block font-medium text-lg py-2 px-3 rounded-md ${isActive('/about') ? 'bg-blue-50 text-blue-700' : 'text-blue-600'} hover:bg-blue-50 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`block font-medium text-lg py-2 px-3 rounded-md ${isActive('/contact') ? 'bg-blue-50 text-blue-700' : 'text-blue-600'} hover:bg-blue-50 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`block font-medium text-lg py-2 px-3 rounded-md ${isActive('/login') ? 'bg-blue-50 text-blue-700' : 'text-blue-600'} hover:bg-blue-50 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon compte
                </Link>
              </li>
              <li>
                <Link 
                  to="/garage/1/dashboard" 
                  className={`block font-medium text-lg py-2 px-3 rounded-md ${isActive('/garage/1/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-blue-600'} hover:bg-blue-50 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;