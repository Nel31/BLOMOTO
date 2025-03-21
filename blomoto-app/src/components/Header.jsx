import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import tikTok from '../assets/3.webp'
import insta from '../assets/images.png'
import face from '../assets/face.avif'
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
      {/* Blue contact bar */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a href="tel:+22959599988" className="flex items-center space-x-2 text-sm hover:text-blue-200">
                <Phone size={16} />
                <span>+229 59599988</span>
              </a>
              <a href="mailto:contact@hecm-afrique.net" className="flex items-center space-x-2 text-sm hover:text-blue-200">
                <Mail size={16} />
                <span>blomoto@gmail.com</span>
              </a>
              <a href="/webmail" className="flex items-center space-x-2 text-sm hover:text-blue-200">
                <Globe size={16} />
                <span>Webmail</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                <img src={face} alt="facebook" className="h-6 w-auto" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                <img src={insta} alt="instagram" className="h-7 w-auto" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                <img src={tikTok} alt="TikTok" className="h-11 w-auto" />
              </a>
              <a href="https://wa.me/22921324889" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <header className="bg-white shadow-sm sticky top-0 z-50">
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
                  className={`font-medium text-xl ${isActive('/') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/service-list" 
                  className={`font-medium text-xl ${isActive('/service-list') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/garage-list" 
                  className={`font-medium text-xl ${isActive('/garage-list') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Garages
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`font-medium text-xl ${isActive('/about') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`font-medium text-xl ${isActive('/contact') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`font-medium text-xl ${isActive('/login') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Mon compte
                </Link>
              </li>
              <li>
                <Link 
                  to="/garage/1/dashboard" 
                  className={`font-medium text-xl ${isActive('/garage/1/dashboard') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Tableau de bord
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white">
            <ul className="flex flex-col space-y-4 p-4">
              <li>
                <Link 
                  to="/" 
                  className={`font-medium ${isActive('/') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/service-list" 
                  className={`font-medium ${isActive('/service-list') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/garage-list" 
                  className={`font-medium ${isActive('/garage-list') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Garages
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`font-medium ${isActive('/about') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`font-medium ${isActive('/contact') ? 'text-black' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                >
                  Contact
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