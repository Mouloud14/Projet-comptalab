// src/components/DashboardRevenu.jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './DashboardRevenu.css';

const formatArgent = (nombre) => new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0));
const COLORS = ['#00BFA5', '#1E88E5', '#7C4DFF', '#00C853', '#FFC107'];

function DashboardRevenu({ allTransactions, selectedDate }) {
  const [timeRange, setTimeRange] = useState('day');

  // --- VÉRIFICATION RENFORCÉE ---
  if (!allTransactions || !Array.isArray(allTransactions)) {
    return <div className="dashboard-wrapper revenu-dashboard">Chargement des revenus...</div>;
  }
  // --- FIN DE LA VÉRIFICATION ---


  // --- LOGIQUE DE CALCUL (reste identique) ---
  const today = new Date();
  const currentYear = today.getFullYear();

  const transactionsToAnalyze = allTransactions.filter(tx => { /* ... (logique filtre identique) ... */
     const txDate = new Date(tx.date);
    if (timeRange === 'day') { return tx.type === 'revenu' && tx.date === selectedDate; }
    else if (timeRange === 'week') { const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); return tx.type === 'revenu' && txDate >= sevenDaysAgo && txDate <= today; }
    else if (timeRange === 'month') { return tx.type === 'revenu' && txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear(); }
    else { return tx.type === 'revenu' && txDate.getFullYear() === currentYear; }
  });

  const totalRevenus = transactionsToAnalyze.reduce((acc, tx) => acc + tx.montant, 0);

   let moyenne = 0;
  if (timeRange === 'week' || timeRange === 'month') {
      const revenusParJour = transactionsToAnalyze.reduce((acc, tx) => { acc[tx.date] = (acc[tx.date] || 0) + tx.montant; return acc; }, {});
      const nombreDeJours = Object.keys(revenusParJour).length;
      if (nombreDeJours > 0) { moyenne = (timeRange === 'week') ? totalRevenus / 7 : totalRevenus / nombreDeJours; }
  }


  const revenusParCategorie = transactionsToAnalyze.reduce((acc, tx) => {
    const categorie = tx.categorie || 'AUTRES';
    acc[categorie] = (acc[categorie] || 0) + tx.montant;
    return acc;
  }, {});

  // On s'assure que pieData est TOUJOURS un tableau
  let pieData = [];
   try {
       pieData = Object.keys(revenusParCategorie).map(categorie => ({
         name: categorie,
         value: revenusParCategorie[categorie]
       })).sort((a, b) => b.value - a.value);
   } catch(e) {
       console.error("Erreur calcul pieData (Revenus):", e);
       // pieData reste []
   }

  return (
    <div className="dashboard-wrapper revenu-dashboard">
      <div className="tabs">
        {/* ... (boutons onglets identiques) ... */}
        <button className={`tab-button ${timeRange === 'day' ? 'active' : ''}`} onClick={() => setTimeRange('day')}>Jour</button>
        <button className={`tab-button ${timeRange === 'week' ? 'active' : ''}`} onClick={() => setTimeRange('week')}>7 Jours</button>
        <button className={`tab-button ${timeRange === 'month' ? 'active' : ''}`} onClick={() => setTimeRange('month')}>Ce Mois</button>
        <button className={`tab-button ${timeRange === 'year' ? 'active' : ''}`} onClick={() => setTimeRange('year')}>Annuel</button>
      </div>

      <div className="chart-section">
          {/* ... (graphique identique, utilise pieData qui est garanti d'être un tableau) ... */}
           {pieData.length > 0 ? ( <ResponsiveContainer width="100%" height={250}> <PieChart> <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={(entry) => `${entry.name} (${(entry.percent * 100).toFixed(0)}%)`}> {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))} </Pie> <Tooltip formatter={(value) => `${formatArgent(value)} DZD`}/> </PieChart> </ResponsiveContainer> ) : ( <div className="no-data-chart"><span>Pas de revenus...</span></div> )}
      </div>

      <div className="stats-section">
         {/* ... (statistiques identiques) ... */}
         <div className="stat-line"><span>Total Revenus (...):</span><span className="stat-value revenu">{formatArgent(totalRevenus)} DZD</span></div>
         {timeRange !== 'day' && timeRange !== 'year' && (<> <hr className="summary-divider" /> <div className="stat-line"><span>Moyenne / jour:</span><span className="stat-value revenu">{formatArgent(moyenne)} DZD</span></div> </>)}
      </div>
    </div>
  );
}

export default DashboardRevenu;