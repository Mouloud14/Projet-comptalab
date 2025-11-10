// src/components/AddCommandeForm.jsx
import React, { useState } from 'react';
import './AddCommandeForm.css'; // On va créer ce CSS

// Listes pour les dropdowns
const typesLivraison = ['Bureau', 'A domicile'];
const etatsInitiaux = ['En préparation', 'Confirmé', 'Non confirmé'];

function AddCommandeForm({ onCommandeAdded }) {
  // Mettre la date du jour par défaut
  const today = new Date().toISOString().slice(0, 10);

  const [nomPrenom, setNomPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [typeLivraison, setTypeLivraison] = useState(typesLivraison[0]);
  const [articles, setArticles] = useState('');
  const [prixTotal, setPrixTotal] = useState(0);
  const [dateCommande, setDateCommande] = useState(today);
  const [etat, setEtat] = useState(etatsInitiaux[0]);
  const [commentaire, setCommentaire] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nomPrenom || !articles || !prixTotal) {
      setError('Nom, Articles et Prix Total sont requis.');
      return;
    }

    const newCommande = {
      nom_prenom: nomPrenom,
      telephone,
      adresse,
      type_livraison: typeLivraison,
      articles,
      prix_total: parseFloat(prixTotal),
      date_commande: dateCommande,
      etat,
      commentaire,
      date_livraison: null // Sera mis à jour plus tard
    };

    try {
      const response = await fetch('`${import.meta.env.VITE_API_URL}`/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommande),
      });

      if (response.ok) {
        alert('Commande ajoutée avec succès !');
        // Vider le formulaire
        setNomPrenom(''); setTelephone(''); setAdresse('');
        setArticles(''); setPrixTotal(0); setDateCommande(today);
        setEtat(etatsInitiaux[0]); setCommentaire('');
        // Prévenir le parent (CommandesPage) pour recharger
        if (typeof onCommandeAdded === 'function') {
          onCommandeAdded();
        }
      } else {
        const errData = await response.json();
        setError(errData.error || 'Erreur lors de l\'ajout.');
      }
    } catch (err) {
      setError('Erreur réseau. Impossible de contacter le serveur.');
      console.error(err);
    }
  };


  return (
    <form className="add-commande-form" onSubmit={handleSubmit}>
      <h3>Ajouter une nouvelle commande</h3>
      {error && <p className="error-message">{error}</p>}
      
      {/* Grille pour les champs */}
      <div className="form-grid-commande">
        {/* Ligne 1 */}
        <div className="form-control-commande">
          <label>Nom Prénom*:</label>
          <input type="text" value={nomPrenom} onChange={e => setNomPrenom(e.target.value)} required />
        </div>
        <div className="form-control-commande">
          <label>Téléphone:</label>
          <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} />
        </div>
         <div className="form-control-commande">
          <label>Date Commande*:</label>
          <input type="date" value={dateCommande} onChange={e => setDateCommande(e.target.value)} required />
        </div>
        
        {/* Ligne 2 */}
         <div className="form-control-commande span-2"> {/* Prend 2 colonnes */}
          <label>Adresse:</label>
          <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} />
        </div>
         <div className="form-control-commande">
          <label>Type Livraison:</label>
          <select value={typeLivraison} onChange={e => setTypeLivraison(e.target.value)}>
            {typesLivraison.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Ligne 3 */}
        <div className="form-control-commande span-2">
          <label>Articles (Description)*:</label>
          <input type="text" value={articles} onChange={e => setArticles(e.target.value)} placeholder="ex: T-shirt Oversize Noir L, Hoodie S..." required />
        </div>
         <div className="form-control-commande">
          <label>Prix Total (DZD)*:</label>
          <input type="number" value={prixTotal} onChange={e => setPrixTotal(e.target.value)} required min="0" />
        </div>
        
        {/* Ligne 4 */}
         <div className="form-control-commande span-2">
          <label>Commentaire (Optionnel):</label>
          <input type="text" value={commentaire} onChange={e => setCommentaire(e.target.value)} />
        </div>
        <div className="form-control-commande">
          <label>État Initial:</label>
          <select value={etat} onChange={e => setEtat(e.target.value)}>
             {etatsInitiaux.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>
      
      <button type="submit" className="btn-submit-commande">Ajouter la Commande</button>
    </form>
  );
}

export default AddCommandeForm;