// src/pages/CommandesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './CommandesPage.css'; 

// Fonction pour convertir les lignes du tableau en objets (inchangée)
const transformData = (data) => {
  if (!data || data.length < 2) return [];

  const headers = data[0].map(header =>
      String(header || '')
        .trim().toLowerCase().replace(/[\s/()]+/g, '_')
        .replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/[îï]/g, 'i')
        .replace(/[ôö]/g, 'o').replace(/[ûü]/g, 'u').replace(/ç/g, 'c')
        .replace(/^_+|_+$/g, '').replace(/[^a-z0-9_]/g, '')
  );
  console.log("En-têtes transformés en clés:", headers);

  const etatKey = 'etat_de_livraison';
  const etatIndex = headers.findIndex(header => header === etatKey);
  if (etatIndex === -1) {
    console.error(`Colonne clé '${etatKey}' non trouvée. Vérifiez l'en-tête Google Sheet.`);
  }

  return data.slice(1).map((row, rowIndex) => {
    const commande = {};
    headers.forEach((header, index) => {
      if (header) {
        commande[header] = row[index] !== undefined && row[index] !== null ? String(row[index]) : '';
      }
    });
    commande.id = `sheet-${rowIndex}`;
    commande.originalRowIndex = rowIndex + 2; 
    return commande;
  });
};


function CommandesPage() {
  const [allCommandes, setAllCommandes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('actifs'); 

  // --- Listes de statuts ---
  const statutsActifs = ['en préparation', 'confirmé', 'prêt a livrer']; // Filtre "actifs"
  
  const allSelectableStatuses = [
      'En préparation', 
      'Confirmé', 
      'Non confirmé',
      'Prêt a livrer', 
      'Echange', 
      'Envoyé', 
      'Annulé'
    ]; 
  const cleEtat = 'etat_de_livraison'; 

  // Fonction pour charger les données (inchangée)
  const fetchCommandes = async () => {
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/sheet-data'); 
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Erreur ${response.status}`);
      }
      const rawData = await response.json();

      if (!Array.isArray(rawData) || rawData.length === 0) {
        setAllCommandes([]); 
        return;
      }

      const transformed = transformData(rawData);
      console.log("Données transformées (toutes):", transformed);
      setAllCommandes(transformed); 

    } catch (err) {
      console.error("Erreur fetchCommandes:", err);
      if (err instanceof SyntaxError) { 
          setError('Impossible de charger les commandes : Erreur de communication avec le serveur (vérifiez URL API).');
      } else {
          setError(`Impossible de charger les commandes : ${err.message}.`);
      }
      setAllCommandes([]);
    } finally {
      if (loading) setLoading(false);
      setUpdatingStatus(null); 
    }
  };

  // Premier chargement (inchangé)
  useEffect(() => {
    setLoading(true); 
    fetchCommandes();
  }, []); 

  // Logique de filtrage et de recherche (inchangée)
  const commandesAffichees = useMemo(() => {
    let filtered = [...allCommandes];
    
    // 1. Filtre par Statut
    const lowerStatusFilter = statusFilter.toLowerCase();
    if (lowerStatusFilter === 'actifs') {
      filtered = filtered.filter(cmd =>
        cmd[cleEtat] && statutsActifs.includes(cmd[cleEtat].trim().toLowerCase())
      );
    } else if (lowerStatusFilter !== 'tous') {
      filtered = filtered.filter(cmd =>
        cmd[cleEtat] && cmd[cleEtat].trim().toLowerCase() === lowerStatusFilter
      );
    }

    // 2. Filtre par Recherche
    const lowerSearch = searchTerm.trim().toLowerCase();
    if (lowerSearch === '') {
      return filtered; 
    }
    return filtered.filter(commande => {
      return Object.values(commande).some(valeur => 
        String(valeur).toLowerCase().includes(lowerSearch)
      );
    });

  }, [allCommandes, statusFilter, searchTerm, cleEtat]); 


  // Fonction pour gérer le changement de statut (inchangée)
  const handleStatusChange = async (commandeId, originalRowIndex, newStatus) => {
     setUpdatingStatus(commandeId); 
     setError('');
     try {
         const response = await fetch('http://localhost:3001/api/sheet-data/update-status', {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 rowIndex: originalRowIndex, 
                 newStatus: newStatus 
             })
         });

         if (!response.ok) {
             const errData = await response.json();
             throw new Error(errData.error || `Erreur ${response.status} lors de la mise à jour`);
         }
         
         setTimeout(() => {
            fetchCommandes(); 
         }, 500); 

     } catch (err) {
         console.error("Erreur handleStatusChange:", err);
         if (err instanceof SyntaxError) {
             setError('Erreur MàJ: Le serveur a répondu incorrectement (vérifiez la route PUT).');
         } else {
             setError(`Erreur mise à jour statut: ${err.message}`);
         }
         setUpdatingStatus(null); 
     } 
  };


  // --- AFFICHAGE ---

  return (
    <div className="commandes-page-content">
      {/* *** MODIFIÉ ICI : Ajout du compteur *** */}
      <h1>
        Commandes Actives
        {/* Affiche le compteur seulement après le chargement et s'il n'y a pas d'erreur */}
        {!loading && !error && (
          <span className="commande-count">
            ({commandesAffichees.length})
          </span>
        )}
      </h1> 

      <div className="commandes-filters-bar">
        <input
          type="text"
          placeholder="Chercher (nom, tél, articles...)"
          className="commandes-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
        <select
          className="commandes-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={loading}
        >
          <option value="actifs">Commandes Actives (Défaut)</option>
          <option value="tous">Toutes les Commandes</option>
          <option disabled>---</option>
          {allSelectableStatuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="loading-message">Chargement...</p>}
      
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="commandes-list-container">
          {commandesAffichees.length > 0 ? (
            commandesAffichees.map((commande) => {
              
              const currentStatusClass = (commande[cleEtat] || 'inconnu')
                  .trim().toLowerCase().replace(/[éèêë]/g, 'e') 
                  .replace(/[àâä]/g, 'a').replace(/\s+/g, '-'); 

              const currentStatusOriginal = commande[cleEtat];
              const cleDateLivraison = 'date_a_livre_si_cest_reporte'; 

              return (
                <div key={commande.id} className={`commande-card status-${currentStatusClass} ${updatingStatus === commande.id ? 'updating' : ''}`}>
                  <div className="card-header">
                    <h3>{commande.nom_prenom || 'Client non spécifié'}</h3>
                    <p>{commande.numero_de_telephone || '-'}</p>
                  </div>
                  <div className="card-body">
                    <p><strong>Adresse :</strong> {commande['wilaya_commune_et_adresse_nom_du_bureau'] || 'Non spécifiée'}</p>
                    <p><strong>Livraison :</strong> {commande.type_de_livraison || '-'}</p>
                    <p><strong>Articles :</strong> <strong>{commande.articles || '-'}</strong></p>
                    <p><strong>Total :</strong> {commande.prix_total || '0'} DZD</p>
                    
                    {commande.commentaire && (
                      <p><small><strong><i>Commentaire : {commande.commentaire}</i></strong></small></p>
                    )}
                    
                    {commande[cleDateLivraison] && (
                      <p><small><strong>Date de livraison :</strong> {commande[cleDateLivraison]}</small></p>
                    )}
                  </div>
                  <div className="card-footer">
                    <small>Commandé le : {commande.date_commande || '--/--/----'}</small>
                    
                    <select
                      value={currentStatusOriginal} 
                      onChange={(e) => handleStatusChange(commande.id, commande.originalRowIndex, e.target.value)}
                      className={`status-select ${currentStatusClass}`} 
                      disabled={updatingStatus === commande.id} 
                    >
                      {!allSelectableStatuses.includes(currentStatusOriginal) && (
                        <option key={currentStatusOriginal} value={currentStatusOriginal}>
                          {currentStatusOriginal}
                        </option>
                      )}
                      
                      {allSelectableStatuses.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-commandes-message">
              {searchTerm ? 'Aucune commande ne correspond à votre recherche.' : 'Aucune commande trouvée pour ce filtre.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CommandesPage;