// src/components/TransactionForm.jsx (Corrigé avec le Token)
import React, { useState, useEffect } from 'react';
import './TransactionForm.css';

const depenseCategories = [ 'DTF', 'STOCK', 'EURO', 'LIVREUR', 'TRANSPORT', 'FOOD', 'AUTRES' ];
const revenuCategories = [ 
  'ZR express', 
  'main a main', 
  'baridi mob', 
  'autre' 
];

function TransactionForm({ 
  onFormSubmit, 
  transactionToEdit, 
  setTransactionToEdit,
  selectedDate, 
  setSelectedDate,
  token // <-- MODIFICATION 1 : Accepte le token
}) { 
  
  const [type, setType] = useState('depense');
  const [montant, setMontant] = useState(0);
  const [categorie, setCategorie] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setMontant(transactionToEdit.montant);
      setCategorie(transactionToEdit.categorie);
      setDescription(transactionToEdit.description);
    } else {
      setType('depense');
      setMontant(0);
      setCategorie('');
      setDescription('');
    }
  }, [transactionToEdit]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategorie('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    if (!selectedDate || !categorie) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const transactionData = { 
      date: selectedDate,
      description, 
      montant: parseFloat(montant), 
      type, 
      categorie 
    };
    
    const isEditMode = transactionToEdit !== null;
    const url = isEditMode ? `http://localhost:3001/api/transactions/${transactionToEdit.id}` : 'http://localhost:3001/api/transactions';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      // --- MODIFICATION 2 : Ajout du header 'Authorization' ---
      const response = await fetch(url, { 
        method: method, 
        headers: { 
        	'Content-Type': 'application/json',
        	'Authorization': `Bearer ${token}` // <-- Le token est maintenant envoyé
        }, 
        body: JSON.stringify(transactionData), 
      });
      // --- FIN DE LA MODIFICATION ---

      if (response.ok) {
        const message = isEditMode ? 'Transaction modifiée !' : 'Transaction ajoutée !';
        alert(message);
        onFormSubmit(); 
        setTransactionToEdit(null);
      } else {
        // Affiche l'erreur si le token est mauvais
        const errData = await response.json();
        alert(`Erreur lors de l'opération: ${errData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur: Impossible de contacter le serveur.');
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      
      <div className="form-header">
        <h2 className="form-title">
          {transactionToEdit ? 'Modifier' : 'Ajouter une transaction'}
        </h2>
    	 <input 
          type="date"
          className="date-input-discrete"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
    	 />
    	 </div>
    	 
    	 <div className="form-control">
    	 	 <label>Type:</label>
    	 	 <select value={type} onChange={(e) => handleTypeChange(e.target.value)}>
    	 	 	 <option value="depense">Dépense</option>
    	 	 	 <option value="revenu">Revenu</option>
    	 	 </select>
    	 </div>

    	 <div className="form-control">
    	 	 <label>Montant (DZD):</label> 
    	 	 <input type="number" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} required />
    	 </div>

    	 <div className="form-control">
    	 	 <label>Catégorie:</label>
    	 	 <select value={categorie} onChange={(e) => setCategorie(e.target.value)} required>
    	 	 	 <option value="" disabled>-- Choisir une catégorie --</option>
    	 	 	 {type === 'depense'
    	 	 	 	 ? depenseCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))
    	 	 	 	 : revenuCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))
    	 	 	 }
    	 	 </select>
    	 </div>

    	 <div className="form-control">
    	 	 <label>Commentaire (Optionnel):</label>
    	 	 <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails, n° de commande, etc." />
    	 </div>
    	 
    	 <div className="form-buttons">
    	 	 <button type="submit" className="btn-submit">
    	 	 	 {transactionToEdit ? 'Mettre à jour' : 'Ajouter'}
    	 	 </button>
    	 	 {transactionToEdit && (
    	 	 	 <button type="button" className="btn-cancel" onClick={() => setTransactionToEdit(null)}>
    	 	 	 	 Annuler
    	 	 	 </button>
    	 	 )}
    	 </div>
  	 </form>
  );
}

export default TransactionForm;