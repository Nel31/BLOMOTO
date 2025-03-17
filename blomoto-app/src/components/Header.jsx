import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <span className="text-2xl font-bold text-primary">BLOMOTO</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><Link to="/" className="font-medium text-primary cursor-pointer">Accueil</Link></li>
              <li><Link to="/service-list" className="font-medium text-primary cursor-pointer">Services</Link></li>
              <li><Link to="/garage-list" className="font-medium text-gray-600 hover:text-primary cursor-pointer">Garages</Link></li>
              <li><Link to="/about" className="font-medium text-gray-600 hover:text-primary cursor-pointer">À propos</Link></li>
              <li><Link to="/contact" className="font-medium text-gray-600 hover:text-primary cursor-pointer">Contact</Link></li>
              <li><Link to="/login" className="font-medium text-gray-600 hover:text-primary cursor-pointer">Login</Link></li>
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
                <li><Link to="/" className="font-medium text-primary cursor-pointer">Accueil</Link></li>
                <li><Link to="/service-list" className="font-medium text-gray-600 cursor-pointer">Services</Link></li>
                <li><Link to="/garage-list" className="font-medium text-gray-600 cursor-pointer">Garages</Link></li>
                <li><Link to="/about" className="font-medium text-gray-600 cursor-pointer">À propos</Link></li>
                <li><Link to="/contact" className="font-medium text-gray-600 cursor-pointer">Contact</Link></li>
              </ul>
            </div>
        )}
      </header>
  );
}

export default Header;
