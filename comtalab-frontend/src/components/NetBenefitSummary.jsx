// src/components/NetBenefitSummary.jsx
import React, { useState } from 'react';
import './NetBenefitSummary.css'; // On garde le CSS

const formatArgent = (nombre) => new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0));

// Reçoit maintenant allTransactions et selectedDate
function NetBenefitSummary({ allTransactions, selectedDate }) {
  // On met "week" (Semaine) comme onglet actif par défaut
  const [timeRange, setTimeRange] = useState('week');

  // --- LOGIQUE DE CALCUL (similaire aux dashboards) ---
  const today = new Date();
  const currentYear = today.getFullYear();

  // 1. Filtrer les transactions (Revenus ET Dépenses) pour la période
  const transactionsToAnalyze = allTransactions.filter(tx => {
    // Vérification de sécurité : si allTransactions n'est pas un tableau, retourne un tableau vide
    if (!Array.isArray(allTransactions)) return [];

    const txDate = new Date(tx.date);
    if (timeRange === 'day') {
      return tx.date === selectedDate;
    } else if (timeRange === 'week') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= sevenDaysAgo && txDate <= today;
    } else if (timeRange === 'month'){ // 'month'
      return txDate.getMonth() === today.getMonth() &&
             txDate.getFullYear() === today.getFullYear();
    } else { // 'year'
       return txDate.getFullYear() === currentYear;
    }
  });

  // 2. Calculer Total Revenus et Total Dépenses pour la période
  const totalRevenus = transactionsToAnalyze
    .filter(tx => tx.type === 'revenu')
    .reduce((acc, tx) => acc + tx.montant, 0);

  const totalDepenses = transactionsToAnalyze
    .filter(tx => tx.type === 'depense')
    .reduce((acc, tx) => acc + tx.montant, 0);

  // 3. Calculer le Bénéfice Net
  const beneficeNet = totalRevenus - totalDepenses;

  // --- FIN LOGIQUE DE CALCUL ---

  // Détermine le label à afficher en fonction de timeRange
  const getTimeLabel = () => {
      switch(timeRange) {
          case 'day': return 'Jour';
          case 'week': return '7 jours';
          case 'month': return 'Mois';
          case 'year': return 'Annuel';
          default: return '';
      }
  }

  return (
    <div className="net-benefit-wrapper">
      {/* Les Onglets */}
      <div className="tabs">
        <button
          className={`tab-button ${timeRange === 'day' ? 'active' : ''}`}
          onClick={() => setTimeRange('day')}
        >
          Jour
        </button>
        <button
          className={`tab-button ${timeRange === 'week' ? 'active' : ''}`}
          onClick={() => setTimeRange('week')}
        >
          7 Jours
        </button>
        <button
          className={`tab-button ${timeRange === 'month' ? 'active' : ''}`}
          onClick={() => setTimeRange('month')}
        >
          Ce Mois
        </button>
         <button
          className={`tab-button ${timeRange === 'year' ? 'active' : ''}`}
          onClick={() => setTimeRange('year')}
        >
          Annuel
        </button>
      </div>

      {/* Le Résultat */}
      <div className="net-benefit-content">
        {/* Affichage des 3 lignes comme avant */}
         <div className="summary-line">
          <span>Total Revenus ({getTimeLabel()}):</span>
          <span className="summary-value revenu">
            {formatArgent(totalRevenus)} DZD
          </span>
        </div>
         <div className="summary-line">
          <span>Total Dépenses ({getTimeLabel()}):</span>
          <span className="summary-value depense">
            {formatArgent(totalDepenses)} DZD
          </span>
        </div>
        <hr className="summary-divider"/>
        {/* Ligne Bénéfice Net */}
        <div className="summary-line total">
          <span className="net-benefit-label">
            Bénéfice Net ({getTimeLabel()}):
          </span>
          <span className={`net-benefit-value ${beneficeNet >= 0 ? 'revenu' : 'depense'}`}>
            {formatArgent(beneficeNet)} DZD
          </span>
        </div>
      </div>
    </div>
  );
}

export default NetBenefitSummary;