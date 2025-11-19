// src/components/TransactionForm.jsx (Ajout de la catégorie "VERSEMENT")
import React, { useState, useEffect } from 'react';
import './TransactionForm.css';

// NOUVEAU: Ajout de "VERSEMENT"
const depenseCategories = [ 'DTF', 'STOCK', 'EURO', 'LIVREUR', 'TRANSPORT', 'FOOD', 'AUTRES' ,'REMBOURSEMENT', 'VERSEMENT' ];
const revenuCategories = [ 
  'ZR express', 
  'main a main', 
  'baridi mob', 
  'autre' 
];

// MAPPING DES DESCRIPTIONS PAR DÉFAUT (Ajouté pour la correction)
const defaultDescriptions = {
    'FOOD': 'Repas / Restaurant',
    'LIVREUR': 'Paiement livreur',
    'ZR express': 'Encaissement des ventes',
    'STOCK': 'Achat de marchandise/matières premières',
    'EURO': 'Achat en devise étrangère',
    'DTF': 'Achat de papier transfert',
    'REMBOURSEMENT': 'Remboursement de frais',
    'baridi mob': 'Virement CCP ou BaridiMob',
    'TRANSPORT': 'Coût de transport non lié à la livraison',
    'VERSEMENT': 'Transfert de fonds ou mise de côté', // NOUVEAU
    'AUTRES': '', 
    'autre': '',
};


function TransactionForm({ 
  onFormSubmit, 
  transactionToEdit, 
  setTransactionToEdit,
  selectedDate, 
  setSelectedDate,
  token
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
      // Réinitialise le formulaire
      setType('depense');
      setMontant(0);
      setCategorie('');
      setDescription('');
    }
  }, [transactionToEdit]);

  // Gère l'auto-remplissage/nettoyage de la description
  useEffect(() => {
    if (!transactionToEdit && categorie) {
        // Applique la description par défaut.
        const defaultText = defaultDescriptions[categorie] || ''; 
        setDescription(defaultText);
    }
  }, [categorie, transactionToEdit]);


  const handleTypeChange = (newType) => {
    setType(newType);
    setCategorie('');
  };
  
  const handleCategoryChange = (e) => {
    setCategorie(e.target.value);
  }


  const handleSubmit = async (event) => {
    event.preventDefault(); 
    if (!selectedDate || !categorie) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const transactionData = { 
      date: selectedDate,
      description: description || null, // Ensure empty string is null for DB
      montant: parseFloat(montant), 
      type, 
      categorie 
    };
    
    const isEditMode = transactionToEdit !== null;
    const url = isEditMode ? `${import.meta.env.VITE_API_URL}/api/transactions/${transactionToEdit.id}` : `${import.meta.env.VITE_API_URL}/api/transactions`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { 
        method: method, 
        headers: { 
        	'Content-Type': 'application/json',
        	'Authorization': `Bearer ${token}` 
        }, 
        body: JSON.stringify(transactionData), 
      });

      if (response.ok) {
        console.log(isEditMode ? 'Transaction modifiée !' : 'Transaction ajoutée !');
        
        onFormSubmit(); // Rafraîchit la liste
        
        if (isEditMode) {
        	setTransactionToEdit(null); // Quitte le mode édition
        } else {
        	// Réinitialise juste les champs modifiables
        	setMontant(0);
        	// Conserve la catégorie et la description pour le prochain ajout rapide
        }
        
      } else {
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
        <select value={categorie} onChange={handleCategoryChange} required>
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