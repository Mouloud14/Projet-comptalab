// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Importe Link pour la navigation
import './HomePage.css'; // Assure-toi que ce fichier CSS existe et est correct

// Reçoit "username" et "currentBalance" en props
function HomePage({ username, currentBalance }) {
  // Fonction pour formater l'argent
  const formatArgent = (nombre) => {
    // Gère le cas où currentBalance n'est pas encore défini (au premier rendu)
    if (nombre == null || isNaN(nombre)) {
      return '...'; // Ou '0', ou ce que tu préfères
    }
    return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0));
  };

  // console.log("HomePage: Reçu username =", username, "et currentBalance =", currentBalance);

  return (
    // Ce div est stylé par HomePage.css et centré par app-container dans App.jsx
    <div className="home-page-content">
      <h1>Bienvenue, {username || 'Utilisateur'} !</h1>
      <p>Tableau de bord principal.</p>

      {/* Affiche le Solde Actuel */}
      <div className="balance-display">
        <span>Solde Actuel :</span>
        <span className={`balance-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
          {formatArgent(currentBalance)} DZD
        </span>
      </div>

      {/* Lien vers les transactions */}
      <Link to="/transactions" className="link-transactions">Gérer les transactions</Link>
    </div>
  );
}

export default HomePage;