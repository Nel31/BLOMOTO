import { useState } from "react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    console.log("Inscription avec :", name, email, password);
    setError("");
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/2.jpeg')" }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md bg-opacity-90">
        <h2 className="text-2xl font-bold text-center text-blue-600">Inscription</h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form onSubmit={handleRegister} className="mt-4">
          <div>
            <label className="block text-gray-700">Nom</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mt-4">
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

          <div className="mt-4">
            <label className="block text-gray-700">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700 transition"
          >
            S'inscrire
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Déjà un compte ? {" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Connectez-vous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
