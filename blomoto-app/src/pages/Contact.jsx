import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail } from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    identity: '',
    email: '',
    telephone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">CONTACTEZ-NOUS</h1>
          <p className="text-white text-center mt-4 text-lg">Nous sommes à votre écoute!</p>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations de contact</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <MapPin className="text-blue-500 w-6 h-6" />
                  <p className="text-gray-600">Rue 514, Cotonou, Bénin</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="text-blue-500 w-6 h-6" />
                  <p className="text-gray-600">+229 5959 99 88</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="text-blue-500 w-6 h-6" />
                  <p className="text-gray-600">contact@blomoto.com</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.0516796222644!2d2.4175!3d6.3675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjInMDMuMCJOIDLCsDI1JzAzLjAiRQ!5e0!3m2!1sfr!2sbj!4v1645789012345!5m2!1sfr!2sbj"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="identity"
                  placeholder="Identité"
                  value={formData.identity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  name="telephone"
                  placeholder="Téléphone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Objet"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Message..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-600 transition duration-300"
              >
                <span>ENVOYER</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}