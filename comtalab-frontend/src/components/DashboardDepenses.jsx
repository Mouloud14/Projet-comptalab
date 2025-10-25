// src/components/DashboardDepenses.jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './DashboardDepenses.css';

const formatArgent = (nombre) => new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0));
const COLORS = ['#FF5722', '#FFC107', '#E53935', '#FB8C00', '#FDD835', '#C62828'];

function DashboardDepenses({ allTransactions, selectedDate }) {
  const [timeRange, setTimeRange] = useState('day');

  // --- VÉRIFICATION RENFORCÉE ---
  // On vérifie si allTransactions n'existe pas OU n'est pas un tableau
  if (!allTransactions || !Array.isArray(allTransactions)) {
    // Affiche un message de chargement ou rien du tout
    return <div className="dashboard-wrapper">Chargement des dépenses...</div>;
  }
  // --- FIN DE LA VÉRIFICATION ---

  // --- LOGIQUE DE CALCUL (reste identique) ---
  const today = new Date();
  const currentYear = today.getFullYear();

  const transactionsToAnalyze = allTransactions.filter(tx => { /* ... (logique filtre identique) ... */
     const txDate = new Date(tx.date);
    if (timeRange === 'day') { return tx.type === 'depense' && tx.date === selectedDate; }
    else if (timeRange === 'week') { const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); return tx.type === 'depense' && txDate >= sevenDaysAgo && txDate <= today; }
    else if (timeRange === 'month') { return tx.type === 'depense' && txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear(); }
    else { return tx.type === 'depense' && txDate.getFullYear() === currentYear; }
  });

  const totalDepenses = transactionsToAnalyze.reduce((acc, tx) => acc + tx.montant, 0);

  let moyenne = 0;
  if (timeRange === 'week' || timeRange === 'month') {
      const depensesParJour = transactionsToAnalyze.reduce((acc, tx) => { acc[tx.date] = (acc[tx.date] || 0) + tx.montant; return acc; }, {});
      const nombreDeJours = Object.keys(depensesParJour).length;
      if (nombreDeJours > 0) { moyenne = (timeRange === 'week') ? totalDepenses / 7 : totalDepenses / nombreDeJours; }
  }

  const depensesParCategorie = transactionsToAnalyze.reduce((acc, tx) => {
    const categorie = tx.categorie || 'AUTRES';
    acc[categorie] = (acc[categorie] || 0) + tx.montant;
    return acc;
  }, {});

  // On s'assure que pieData est TOUJOURS un tableau, même si Object.keys échoue
  let pieData = [];
  try {
      pieData = Object.keys(depensesParCategorie).map(categorie => ({
        name: categorie,
        value: depensesParCategorie[categorie]
      })).sort((a, b) => b.value - a.value);
  } catch(e) {
      console.error("Erreur calcul pieData (Dépenses):", e);
      // pieData reste []
  }


  return (
    <div className="dashboard-wrapper">
      <div className="tabs">
         {/* ... (boutons onglets identiques) ... */}
         <button className={`tab-button ${timeRange === 'day' ? 'active' : ''}`} onClick={() => setTimeRange('day')}>Jour</button>
         <button className={`tab-button ${timeRange === 'week' ? 'active' : ''}`} onClick={() => setTimeRange('week')}>7 Jours</button>
         <button className={`tab-button ${timeRange === 'month' ? 'active' : ''}`} onClick={() => setTimeRange('month')}>Ce Mois</button>
         <button className={`tab-button ${timeRange === 'year' ? 'active' : ''}`} onClick={() => setTimeRange('year')}>Annuel</button>
      </div>

      <div className="chart-section">
         {/* ... (graphique identique, utilise pieData qui est garanti d'être un tableau) ... */}
         {pieData.length > 0 ? ( <ResponsiveContainer width="100%" height={250}> <PieChart> <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={(entry) => `${entry.name} (${(entry.percent * 100).toFixed(0)}%)`}> {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))} </Pie> <Tooltip formatter={(value) => `${formatArgent(value)} DZD`}/> </PieChart> </ResponsiveContainer> ) : ( <div className="no-data-chart"><span>Pas de dépenses...</span></div> )}
      </div>

      <div className="stats-section">
         {/* ... (statistiques identiques) ... */}
         <div className="stat-line"><span>Total Dépenses (...):</span><span className="stat-value depense">{formatArgent(totalDepenses)} DZD</span></div>
         {timeRange !== 'day' && timeRange !== 'year' && (<> <hr className="summary-divider" /> <div className="stat-line"><span>Moyenne / jour:</span><span className="stat-value depense">{formatArgent(moyenne)} DZD</span></div> </>)}
      </div>
    </div>
  );
}

export default DashboardDepenses;