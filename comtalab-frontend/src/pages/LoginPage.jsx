import React, { useState } from 'react';
import './LoginPage.css';
// Ligne 4 : require('dotenv').config(); - Supprimée pour la compatibilité navigateur.

// Les fonctions et constantes du backend (parseArticleCost, BUNDLES, articleDetails, etc.)
// ont été retirées du fichier pour éviter les erreurs ReferenceError dans le navigateur.

function LoginPage({ onLogin }) { // Reçoit la fonction onLogin de App.jsx
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);


  const BASE_API_URL = `${import.meta.env.VITE_API_URL}`;


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Veuillez remplir les deux champs.");
      return;
    }

    const apiUrl = isRegisterMode 
      ? `${BASE_API_URL}/register` 
      : `${BASE_API_URL}/login`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });
      
      const data = await response.json();

      if (response.ok) {
        if (isRegisterMode) {
          setMessage("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
          setIsRegisterMode(false);
          setUsername('');
          setPassword('');
        } else {
          // Connexion réussie
          if (typeof onLogin === 'function') {
            // Sauvegarde le token pour les requêtes futures
            localStorage.setItem('authToken', data.token);
            // On envoie l'objet 'user' ET le 'token'
            onLogin(data.user, data.token); 
          } else {
            console.error("LoginPage Erreur: onLogin n'est pas une fonction !");
            setError("Erreur interne (onLogin).");
          }
        }
      } else {
        // Gère les erreurs renvoyées par le backend
        setError(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      console.error("LoginPage: Erreur Fetch:", err);
      setError('Erreur de connexion au serveur.');
    }
  };

  // --- Début du rendu JSX ---
  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{isRegisterMode ? 'Créer un compte' : 'Connexion'}</h2>
        
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <div className="form-control">
          <label>Nom d'utilisateur:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
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
        
        <button type="submit" className="btn-submit">
          {isRegisterMode ? 'Créer le compte' : 'Se connecter'}
        </button>
        
        <button 
          type="button" 
          className="btn-toggle-mode" 
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setError('');
            setMessage('');
          }}
        >
          {isRegisterMode ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? En créer un'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;