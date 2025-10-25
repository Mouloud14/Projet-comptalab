// src/pages/CommandesPage.jsx
import React, { useState, useEffect } from 'react';
import './CommandesPage.css';
import AddCommandeForm from '../components/AddCommandeForm'; // <-- 1. IMPORTER LE FORMULAIRE

// Liste des états possibles (inchangée)
const ETATS_LIVRAISON = [
    'En préparation',
    'Confirmé',
    'Non confirmé',
    'Envoyé',
    'Annulé',
];

function CommandesPage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger les commandes
  const fetchCommandes = async () => {
    // Ne met pas setLoading(true) si c'est juste un refresh
    // setLoading(true); 
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/commandes', { cache: 'no-store' });
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      setCommandes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Impossible de charger les commandes: " + err.message);
      setCommandes([]);
    } finally {
      setLoading(false); // S'assure que le chargement est terminé
    }
  };

  // Charger les commandes au montage
  useEffect(() => {
    fetchCommandes();
  }, []);

  // Fonction pour mettre à jour (inchangée)
  const handleUpdateCommande = async (id, field, value) => {
    try {
      const response = await fetch(`http://localhost:3001/api/commandes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) throw new Error('Échec de la mise à jour');
      setCommandes(prevCommandes =>
        prevCommandes.map(cmd =>
          cmd.id === id ? { ...cmd, [field]: value } : cmd
        )
      );
    } catch (err) {
      console.error("Erreur MàJ commande:", err);
      alert('Erreur lors de la mise à jour.');
      fetchCommandes(); // Recharger en cas d'erreur
    }
  };


  return (
    <div className="commandes-page-content">
      <h2>Gestion des Commandes</h2>
      
      {/* --- 2. AFFICHER LE FORMULAIRE --- */}
      {/* On passe la fonction fetchCommandes en prop pour le refresh */}
      <AddCommandeForm onCommandeAdded={fetchCommandes} />
      {/* --- FIN FORMULAIRE --- */}


      <hr className="divider"/>

      <h3>Liste des Commandes</h3> {/* Ajout d'un sous-titre */}

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Chargement des commandes...</p>}

      {!loading && !error && (
        <div className="table-container">
          <table className="commandes-table">
            {/* ... (thead et tbody restent identiques) ... */}
            <thead>
              <tr>
                <th>État</th>
                <th>Nom Prénom</th>
                <th>Téléphone</th>
                <th>Articles</th>
                <th>Prix Total</th>
                <th>Date Commande</th>
                <th>Date Livraison</th>
                <th>Type Livraison</th>
                <th>Adresse</th>
                <th>Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {commandes.length === 0 && (
                <tr><td colSpan="10" className="empty-stock">Aucune commande.</td></tr>
              )}
              {commandes.map(cmd => (
                <tr key={cmd.id} className={`etat-${cmd.etat?.toLowerCase().replace(/ /g, '-')}`}>
                  <td className="cell-etat">
                    <select
                      value={cmd.etat}
                      onChange={(e) => handleUpdateCommande(cmd.id, 'etat', e.target.value)}
                      className="etat-select"
                    >
                      {ETATS_LIVRAISON.map(etat => (
                        <option key={etat} value={etat}>{etat}</option>
                      ))}
                    </select>
                  </td>
                  <td>{cmd.nom_prenom}</td>
                  <td>{cmd.telephone}</td>
                  <td>{cmd.articles}</td>
                  <td className="cell-prix">{cmd.prix_total} DZD</td>
                  <td className="cell-date">{cmd.date_commande}</td>
                  <td className="cell-date">
                     <input
                        type="text"
                        defaultValue={cmd.date_livraison || ''}
                        onBlur={(e) => handleUpdateCommande(cmd.id, 'date_livraison', e.target.value)}
                        placeholder="JJ/MM/AAAA"
                        className="table-input"
                      />
                  </td>
                  <td>{cmd.type_livraison}</td>
                  <td className="cell-adresse">{cmd.adresse}</td>
                  <td className="cell-commentaire">
                      <input
                        type="text"
                        defaultValue={cmd.commentaire || ''}
                        onBlur={(e) => handleUpdateCommande(cmd.id, 'commentaire', e.target.value)}
                        placeholder="..."
                        className="table-input"
                      />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CommandesPage;