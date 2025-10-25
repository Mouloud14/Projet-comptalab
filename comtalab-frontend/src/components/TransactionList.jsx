// src/components/TransactionList.jsx
import React from 'react';
import './TransactionList.css';

function TransactionList({
  displayedTransactions,
  onDelete,
  onEdit,
  selectedDate,
  onDateChange,
  totalDepensesJour
}) {

  const formatArgent = (nombre) => new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0));

  const totalRevenusJour = displayedTransactions
    .filter(tx => tx.type === 'revenu')
    .reduce((acc, tx) => acc + tx.montant, 0);

  return (
    <div>
      <div className="list-header">
        <h2 className="list-title">Liste des Transactions</h2>
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
          // --- C'EST ICI LA MODIFICATION ---
          let mainText = tx.categorie; // Par défaut, on affiche la catégorie
          let subText = tx.description; // Et le commentaire en dessous

          // Si la catégorie est "AUTRES" ET qu'il y a un commentaire
          if (tx.categorie === 'AUTRES' && tx.description) {
            mainText = tx.description; // Le commentaire devient le texte principal
            subText = 'AUTRES';        // "AUTRES" devient le texte secondaire
          }
          // --- FIN DE LA MODIFICATION ---

          return (
            <li key={tx.id} className={`transaction-item ${tx.type}`}>

              <div className="transaction-details">
                {/* On utilise les variables mainText et subText */}
                <span className="transaction-description">{mainText}</span>
                <span className="transaction-meta">
                  {tx.date}
                  {/* On affiche subText seulement s'il existe */}
                  {subText && ` (${subText})`}
                </span>
              </div>

              <div className="transaction-montant">
                {tx.type === 'revenu' ? '+' : '-'} {formatArgent(tx.montant)} DZD
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
          <span className="summary-value depense">
            {formatArgent(totalDepensesJour)} DZD
          </span>
        </div>
      </div>

    </div>
  );
}

export default TransactionList;