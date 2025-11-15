// src/components/TransactionList.jsx
import React from 'react';
import './TransactionList.css';

function TransactionList({
  displayedTransactions,
  onDelete,
  onEdit,
  selectedDate,
  onDateChange,
  totalDepensesJour,
  soldeTotal // 🚨 Reçoit le solde total de App.jsx
}) {

  // ✅ Correction de la fonction formatArgent pour gérer undefined/null
  const formatArgent = (nombre) => {
    const num = nombre || 0;
    // On doit s'assurer que num est un nombre pour toFixed
    if (typeof num !== 'number') return new Intl.NumberFormat('fr-FR').format(0);
    return new Intl.NumberFormat('fr-FR').format(num.toFixed(0));
  };

  // ✅ Sécuriser le totalRevenusJour
  const totalRevenusJour = displayedTransactions
    .filter(tx => tx.type === 'revenu')
    .reduce((acc, tx) => acc + (tx.montant || 0), 0) || 0;

  // Sécuriser et déterminer la classe pour le solde total (pour le CSS)
  const finalSolde = soldeTotal || 0;
  const soldeClass = finalSolde >= 0 ? 'revenu' : 'depense';

  return (
    <div>
      <div className="list-header">
        <h2 className="list-title">Liste des Transactions</h2>
        
        {/* 🚨 AFFICHAGE DU SOLDE TOTAL : Placement fixe à droite du titre */}
        <div className={`solde-fixe ${soldeClass}`}>
          <span className="solde-label">Solde Total Actuel:</span>
          <span className="summary-value">
            {formatArgent(finalSolde)} DZD
          </span>
        </div>
        
        <input
          type="date"
          className="date-input-discrete"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      <ul className="transaction-list">

        {displayedTransactions.length === 0 && (
          <li className="empty-list-item">Aucune transaction pour cette date.</li>
        )}

        {displayedTransactions.map(tx => {
          let mainText = tx.categorie; 
          let subText = tx.description; 

          // Logique d'affichage si la catégorie est "AUTRES"
          if (tx.categorie === 'AUTRES' && tx.description) {
            mainText = tx.description; 
            subText = 'AUTRES'; 
          }

          return (
            <li key={tx.id} className={`transaction-item ${tx.type}`}>

              <div className="transaction-details">
                <span className="transaction-description">{mainText}</span>
                <span className="transaction-meta">
                  {tx.date}
                  {/* On affiche subText seulement s'il existe et est non vide */}
                  {subText && subText.trim() !== '' && ` (${subText})`} 
                </span>
              </div>

              <div className="transaction-montant">
                {tx.type === 'revenu' ? '+' : '-'} {formatArgent(tx.montant || 0)} DZD
              </div>

              <div className="transaction-actions">
                <button onClick={() => onEdit(tx)} className="btn-edit">Modifier</button>
                <button onClick={() => onDelete(tx.id)} className="btn-delete">Supprimer</button>
              </div>

            </li>
          );
        })}
      </ul>

      <div className="list-summary">
        <div className="summary-line day-total">
          <span>Revenus (Jour):</span>
          <span className="summary-value revenu">
            {formatArgent(totalRevenusJour)} DZD
          </span>
        </div>
        <div className="summary-line day-total">
          <span>Dépenses (Jour):</span>
          {/* S'assurer que totalDepensesJour est sécurisé (fait par le parent mais on met un || 0) */}
          <span className="summary-value depense">
            {formatArgent(totalDepensesJour || 0)} DZD
          </span>
        </div>
      </div>

    </div>
  );
}

export default TransactionList;