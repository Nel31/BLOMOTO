import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import GetStarted from './components/GetStarted';
import Footer from './components/Footer';

function App() {
  // Définition des couleurs principales pour le thème du site
  React.useEffect(() => {
    // Vous pouvez définir des variables CSS personnalisées ici si nécessaire
    document.documentElement.style.setProperty('--color-primary', '#4F46E5');
    document.documentElement.style.setProperty('--color-dark', '#1F2937');
  }, []);

  return (
    <div className="App">
      <Header />
      <Hero />
      <Features />
      <Services />
      <Stats />
      <Testimonials />
      <GetStarted />
      <Footer />
    </div>
  );
}

export default App;