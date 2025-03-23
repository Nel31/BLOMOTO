import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Homepage/Home';
import GarageCards from './pages/Cards/GarageCards';
import GarageList from './pages/List/GarageList';
import About from './pages/About';
import Header from './components/Header';
import Footer from './components/Footer';
import ServicesList from './pages/Services/ServiceList';
import Register from './pages/Register';
import Login from './pages/Login';
import GarageDetails from './pages/List/GarageDetails';
import GarageDashboard from './pages/List/GarageDashboard';
import { Contact } from './pages/Contact';
import Profile from './components/Profile';

function App() {
  // Définition des couleurs principales pour le thème du site
  React.useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', '#4F46E5');
    document.documentElement.style.setProperty('--color-dark', '#1F2937');
  }, []);

  return (
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
  );
}

export default App;