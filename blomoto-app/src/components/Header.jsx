import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, Globe, MessageCircle, User, LogOut } from 'lucide-react';
import logo from '../assets/4.png';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in by looking for access token
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, [location]); // Re-check when location changes

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    navigate('/login');
  };

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
            <ul className="flex space-x-8 items-center">
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
              {isLoggedIn ? (
                <li className="relative">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-blue-600 hover:text-black transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200">
                      <User className="text-white" size={24} />
                    </div>
                  </Link>
                </li>
              ) : (
                <li>
                  <Link 
                    to="/login" 
                    className={`font-medium text-xl ${isActive('/login') ? 'text-black font-semibold' : 'text-blue-600'} hover:text-black transition-colors duration-200`}
                  >
                    Mon compte
                  </Link>
                </li>
              )}
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
              {isLoggedIn ? (
                <>
                  <li>
                    <Link 
                      to="/profile" 
                      className="block font-medium text-lg py-2 px-3 rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left font-medium text-lg py-2 px-3 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <LogOut size={20} />
                      <span>Déconnexion</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link 
                    to="/login" 
                    className={`block font-medium text-lg py-2 px-3 rounded-md ${isActive('/login') ? 'bg-blue-50 text-blue-700' : 'text-blue-600'} hover:bg-blue-50 transition-colors duration-200`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon compte
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;