import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8000/user_app/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        console.log("Connexion réussie :", data);
        navigate("/"); // Redirection vers la page d'accueil au lieu de /dashboard
      } else {
        setError(data.error || "Erreur lors de la connexion.");
      }
    } catch (error) {
      setError("Problème de connexion au serveur.");
      console.error("Erreur:", error);
    }
  };
  
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-gray-100"
      style={{ backgroundImage: "url('/2.jpeg')" }}
    >
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md backdrop-blur-sm bg-white/90 transform hover:scale-[1.01] transition-transform">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Connexion</h2>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200 font-semibold"
          >
            Se connecter
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 font-medium"
            >
              <FcGoogle className="w-5 h-5" />
              Continuer avec Google
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
            >
              Inscrivez-vous
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;