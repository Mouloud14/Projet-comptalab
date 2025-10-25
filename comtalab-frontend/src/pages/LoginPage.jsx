// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import './LoginPage.css'; // Assure-toi que ce fichier CSS existe

function LoginPage({ onLogin }) { // Reçoit la fonction onLogin de App.jsx
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); // Empêche la page de se recharger
    setError(''); // Vide les anciennes erreurs

    // Correction importante : enlève les espaces au début ou à la fin
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Vérifie que les champs ne sont pas vides après nettoyage
    if (!trimmedUsername || !trimmedPassword) {
        setError("Veuillez remplir les deux champs.");
        return; // Arrête la fonction ici
    }

    try {
      const apiUrl = 'http://localhost:3001/api/login';
      
      // Envoie la requête au backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Envoie les données "nettoyées"
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });

      // Gère la réponse
      if (response.ok) {
        // Connexion réussie !
        if (typeof onLogin === 'function') {
            onLogin(trimmedUsername); // Appelle la fonction de App.jsx avec le nom d'utilisateur
        } else {
            console.error("LoginPage Erreur: onLogin n'est pas une fonction !");
            setError("Erreur interne (onLogin).");
        }
      } else {
        // Échec (ex: 401 - Identifiants incorrects)
        setError('Nom d\'utilisateur ou mot de passe incorrect.');
      }
    } catch (err) {
      // Erreur réseau (backend éteint, CORS, etc.)
      console.error("LoginPage: Erreur Fetch:", err);
      setError('Erreur de connexion au serveur.');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Connexion</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-control">
          <label>Nom d'utilisateur:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus // Met le curseur ici au chargement
          />
        </div>
        <div className="form-control">
          <label>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-submit">Se connecter</button>
      </form>
    </div>
  );
}

export default LoginPage;