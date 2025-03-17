import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    console.log("Connexion avec :", email, password);
    setError("");
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/2.jpeg')" }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md bg-opacity-90">
        <h2 className="text-2xl font-bold text-center text-blue-600">Connexion</h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form onSubmit={handleLogin} className="mt-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700">Mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-500 hover:underline"
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
