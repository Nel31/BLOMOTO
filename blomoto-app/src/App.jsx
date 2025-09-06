import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Profile from './components/Profile';
import { GarageProvider } from './context/GarageContext';
import { AuthProvider } from './context/AuthContext';
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
import AdminDashboard from './pages/Admin/AdminDashboard';
import GaragisteDashboard from './pages/Garagiste/GaragisteDashboard';
import TestAuth from './pages/TestAuth';

function App() {
  // Définition des couleurs principales pour le thème du site
  React.useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', '#4F46E5');
    document.documentElement.style.setProperty('--color-dark', '#1F2937');
  }, []);

  return (
    <AuthProvider>
      <GarageProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              {/* Routes publiques avec header et footer */}
              <Route path="/" element={
                <>
                  <Header />
                  <Home />
                  <Footer />
                </>
              } />
              <Route path="/service-list" element={
                <>
                  <Header />
                  <ServicesList />
                  <Footer />
                </>
              } />
              <Route path="/garage-list" element={
                <>
                  <Header />
                  <GarageList />
                  <Footer />
                </>
              } />
              <Route path="/garage-cards" element={
                <>
                  <Header />
                  <GarageCards />
                  <Footer />
                </>
              } />
              <Route path="/about" element={
                <>
                  <Header />
                  <About />
                  <Footer />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Header />
                  <Contact />
                  <Footer />
                </>
              } />
              <Route path="/register" element={
                <>
                  <Header />
                  <Register />
                  <Footer />
                </>
              } />
              <Route path="/login" element={
                <>
                  <Header />
                  <Login />
                  <Footer />
                </>
              } />
              <Route path="/test-auth" element={
                <>
                  <Header />
                  <TestAuth />
                  <Footer />
                </>
              } />
              <Route path="/garage/:id" element={
                <>
                  <Header />
                  <GarageDetails />
                  <Footer />
                </>
              } />
              
              {/* Routes privées SANS header ni footer */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/garagiste/dashboard" element={<GaragisteDashboard />} />
              <Route path="/garage/:id/dashboard" element={<GarageDashboard />} />
              <Route path="/profile" element={
                <>
                  <Header />
                  <Profile />
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </GarageProvider>
    </AuthProvider>
  );
}

export default App;