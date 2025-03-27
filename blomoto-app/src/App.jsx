import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Profile from './components/Profile';
import { GarageProvider } from './context/GarageContext';
import About from './pages/About';
import GarageCards from './pages/Cards/GarageCards';
import { Contact } from './pages/Contact';
import Home from './pages/Homepage/Home';
import GarageDashboard from './pages/List/GarageDashboard';
import GarageDetails from './pages/List/GarageDetails';
import GarageList from './pages/List/GarageList';
import Login from './pages/Login';
import Register from './pages/Register';
import ServicesList from './pages/Services/ServiceList';

function App() {
  // Définition des couleurs principales pour le thème du site
  React.useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', '#4F46E5');
    document.documentElement.style.setProperty('--color-dark', '#1F2937');
  }, []);

  return (
    <GarageProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/service-list" element={<ServicesList />} />
            <Route path="/garage-list" element={<GarageList />} />
            <Route path="/garage-cards" element={<GarageCards />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/garage/:id" element={<GarageDetails />} />
            <Route path="/garage/:id/dashboard" element={<GarageDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </GarageProvider>
  );
}

export default App;