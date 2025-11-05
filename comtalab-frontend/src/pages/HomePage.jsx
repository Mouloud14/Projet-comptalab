// src/pages/HomePage.jsx (Corrigé - Affiche Top 3 et Top 5 Wilayas)
import React, { useState, useEffect, useMemo } from 'react'; 
import { Link } from 'react-router-dom';
import './HomePage.css'; 

const formatArgent = (nombre) => {
  if (nombre == null || isNaN(nombre)) {
    return '...';
  }
  return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0));
};

function HomePage({ username, currentBalance, token, transactionsDuJour }) {
  
  const [dashboardData, setDashboardData] = useState(null); 
  // (On n'a plus besoin de lowStockData ici)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      if (!token) return; 
      
      setLoading(true);
      try {
        // On n'appelle plus /api/stock-low
        const response = await fetch('http://localhost:3001/api', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erreur chargement dashboard');

        const dashData = await response.json();
        setDashboardData(dashData);

      } catch (err) {
        console.error("Erreur fetchAllDashboardData:", err);
        setDashboardData({ totalStockValue: 0, todaysPotentialGain: 0, topCategories: [], topWilayas: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [token, currentBalance]); // Se rafraîchit si le solde change

  const stockValue = dashboardData?.totalStockValue || 0;
  const companyValue = (currentBalance || 0) + stockValue;
  const todaysGain = dashboardData?.todaysPotentialGain || 0;
  const topCategories = dashboardData?.topCategories || [];
  const topWilayas = dashboardData?.topWilayas || []; // <-- NOUVEAU
  const transactions = transactionsDuJour.slice(0, 5) || []; 

  if (loading) {
    return (
      <div className="home-page-content">
        <h1>Bienvenue, {username || 'Utilisateur'} !</h1>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
  	 <div className="home-page-content">
  	 	 <h1>Bienvenue, {username || 'Utilisateur'} !</h1>
  	 	 <p>Tableau de bord principal.</p>

      {/* 1. Cartes de Chiffres (inchangées) */}
  	 	 <div className="home-stats-grid">
  	 	 	 <div className="stat-card">
  	 	 	 	 <span className={`balance-value ${companyValue >= 0 ? 'positive' : 'negative'}`}>
  	 	 	 	 	 {formatArgent(companyValue)} DZD
  	 	 	 	 </span>
  	 	 	 	 <h2>Valeur de l'Entreprise</h2>
  	 	 	 	 <p>Solde Actuel + Valeur du Stock ({formatArgent(stockValue)})</p>
  	 	 	 	 <Link to="/stock" className="link-transactions">Gérer le stock</Link>
  	 	 	 </div>
  	 	 	 <div className="stat-card primary-stat"> 
  	 	 	 	 <span className={`balance-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
  	 	 	 	 	 {formatArgent(currentBalance)} DZD
  	 	 	 	 </span>
  	 	 	 	 <h2>Solde Actuel (Transactions)</h2>
  	 	 	 	 <p>Votre argent liquide disponible.</p>
  	 	 	 	 <Link to="/transactions" className="link-transactions">Gérer les transactions</Link>
  	 	 	 </div>
  	 	 	 <div className="stat-card">
  	 	 	 	 <span className={`balance-value ${todaysGain >= 0 ? 'positive' : 'negative'}`}>
  	 	 	 	 	 {formatArgent(todaysGain)} DZD
  	 	 	 	 </span>
  	 	 	 	 <h2>Gain Net du Jour</h2>
  	 	 	 	 <p>Gain net des commandes confirmées aujourd'hui.</p>
  	 	 	 	 <Link to="/commandes" className="link-transactions">Voir les commandes</Link>
  	 	 	 </div>
  	 	 </div>

      {/* 2. Aperçu en Direct (MODIFIÉ) */}
      <div className="live-preview-grid">
        
        {/* Top 3 Ventes */}
        <div className="preview-card">
          <h2>Top 3 des Ventes (Catégories)</h2>
          {topCategories.length > 0 ? (
            <ul className="top-list">
              {topCategories.map((item, index) => (
                <li key={index}>
                  <span className="top-name">{item.name}</span>
                  <span className="top-count">{item.count} ventes</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Aucune vente enregistrée.</p>
          )}
        </div>

        {/* Dernières Transactions du Jour */}
        <div className="preview-card">
          <h2>Transactions du Jour (Les 5 dernières)</h2>
          {transactions.length > 0 ? (
            <ul className="home-transaction-list">
              {transactions.map(tx => (
                <li key={tx.id} className={tx.type}>
                  <span className="tx-desc">{tx.description || tx.categorie}</span>
                  <span className={`tx-montant ${tx.type}`}>
                    {tx.type === 'revenu' ? '+' : '-'} {formatArgent(tx.montant)} DZD
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Aucune transaction aujourd'hui.</p>
          )}
        </div>

        {/* Top 5 Wilayas (REMPLACE Stock Faible) */}
        <div className="preview-card">
          <h2>Top 5 Wilayas (Commandes)</h2>
          {topWilayas.length > 0 ? (
            <ul className="top-list"> {/* Réutilise le style du Top 3 */}
              {topWilayas.map((item, index) => (
                <li key={index}>
                  <span className="top-name">{item.name}</span>
                  <span className="top-count">{item.count} commandes</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Aucune commande trouvée.</p>
          )}
        </div>

      </div>

  	 </div>
  );
}

export default HomePage;