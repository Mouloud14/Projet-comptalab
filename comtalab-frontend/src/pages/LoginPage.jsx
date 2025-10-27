// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) { // Reçoit la fonction onLogin de App.jsx
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
        setError("Veuillez remplir les deux champs.");
        return;
    }

    try {
      const apiUrl = 'http://localhost:3001/api/login';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });

      if (response.ok) {
        // NOUVEAU : Récupère les données de l'utilisateur
        const data = await response.json(); 
        
        if (typeof onLogin === 'function') {
            // Envoie l'objet utilisateur entier (id, username, google_sheet_url) à App.jsx
            onLogin(data.user); 
        } else {
            console.error("LoginPage Erreur: onLogin n'est pas une fonction !");
            setError("Erreur interne (onLogin).");
        }
      } else {
        setError('Nom d\'utilisateur ou mot de passe incorrect.');
      }
    } catch (err) {
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
        <button type="submit" className="btn-submit">Se connecter</button>
      </form>
    </div>
  );
}

export default LoginPage;