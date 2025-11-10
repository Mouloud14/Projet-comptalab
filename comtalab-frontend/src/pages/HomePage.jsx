// src/pages/HomePage.jsx (Final - Utilise le solde précis de l'API)
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
  const [loading, setLoading] = useState(true);
  // État local pour le solde total précis (mis à jour par l'API)
  const [totalBalance, setTotalBalance] = useState(currentBalance || 0);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      if (!token) return;

      setLoading(true);
      try {

        // Appel de la nouvelle route d'API du dashboard
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard-data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erreur chargement dashboard');

        const dashData = await response.json();
        setDashboardData(dashData);

        // Mise à jour du solde depuis la DB (le plus précis)
        setTotalBalance(dashData.totalBalance);

      } catch (err) {
        console.error("Erreur fetchAllDashboardData:", err);
        setDashboardData({ totalStockValue: 0, todaysPotentialGain: 0, topCategories: [], topWilayas: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [token, currentBalance]);


  const stockValue = dashboardData?.totalStockValue || 0;
  // Calcule la valeur de l'entreprise avec le solde précis récupéré
  const companyValue = totalBalance + stockValue;
  const todaysGain = dashboardData?.todaysPotentialGain || 0;
  const topCategories = dashboardData?.topCategories || [];
  const topWilayas = dashboardData?.topWilayas || [];
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

      {/* 1. Cartes de Chiffres */}
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
          <span className={`balance-value ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
            {formatArgent(totalBalance)} DZD
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

      {/* 2. Aperçu en Direct */}
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