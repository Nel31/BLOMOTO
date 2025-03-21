import React from 'react';
import logo from '../assets/1.png';

function Footer() {
  const handleNavigation = (section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <footer id="contact" className="bg-dark text-white py-6">
      <div className="container mx-auto px-4">
        <p className="text-center text-lg">2025 BLOMOTO. Tous droits réservés</p>
      </div>
    </footer>
  );
}

export default Footer;