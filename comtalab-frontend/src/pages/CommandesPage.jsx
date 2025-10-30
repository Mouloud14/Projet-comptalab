// src/pages/CommandesPage.jsx (Corrigé avec gestion du Token et de l'URL)
import React, { useState, useEffect, useMemo } from 'react';
import './CommandesPage.css'; 

// ... (La fonction transformData est inchangée) ...
const transformData = (data) => {
  if (!data || data.length < 2) return [];
  const headers = data[0].map(header =>
      String(header || '')
        .trim().toLowerCase().replace(/[\s/()]+/g, '_')
        .replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/[îï]/g, 'i')
        .replace(/[ôö]/g, 'o').replace(/[ûü]/g, 'u').replace(/ç/g, 'c')
        .replace(/^_+|_+$/g, '').replace(/[^a-z0-9_]/g, '')
  );
  const etatKey = 'etat_de_livraison';
  const etatIndex = headers.findIndex(header => header === etatKey);
  if (etatIndex === -1) {
    console.warn(`Colonne clé '${etatKey}' non trouvée. Vérifiez l'en-tête Google Sheet.`);
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


// MODIFIÉ : Accepte 'token', 'user', et 'onUserUpdate'
function CommandesPage({ token, user, onUserUpdate }) {
  const [allCommandes, setAllCommandes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('actifs'); 

  // NOUVEAU : États pour gérer le formulaire de lien
  const [sheetUrl, setSheetUrl] = useState(user?.google_sheet_url || '');
  const [urlSaveMessage, setUrlSaveMessage] = useState('');

  // ... (Listes de statuts inchangées) ...
  const statutsActifs = ['en préparation', 'confirmé', 'prêt a livrer'];
  const allSelectableStatuses = [
      'En préparation', 'Confirmé', 'Non confirmé',
      'Prêt a livrer', 'Echange', 'Envoyé', 'Annulé'
  ]; 
  const cleEtat = 'etat_de_livraison'; 

  // MODIFIÉ : Utilise le token dans le fetch
  const fetchCommandes = async () => {
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/sheet-data', {
        // AJOUTÉ : Headers d'authentification
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); 
      
      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        // C'est l'erreur 404 que tu as eue
        if (response.status === 404 && errData.error.includes('Aucun lien Google Sheet')) {
          throw new Error("Aucun lien Google Sheet n'est configuré pour ce compte.");
        }
        throw new Error(errData.error || `Erreur ${response.status}`);
      }
      const rawData = await response.json();

      if (!Array.isArray(rawData) || rawData.length === 0) {
        setAllCommandes([]); 
        return;
      }

      const transformed = transformData(rawData);
      setAllCommandes(transformed); 

    } catch (err) {
      console.error("Erreur fetchCommandes:", err);
      setError(`Impossible de charger les commandes : ${err.message}.`);
      setAllCommandes([]);
    } finally {
      if (loading) setLoading(false);
      setUpdatingStatus(null); 
    }
  };

  // MODIFIÉ : Dépend du token
  useEffect(() => {
    setLoading(true); 
    if (token) {
      fetchCommandes();
    } else {
      setLoading(false);
      setError("Non connecté.");
      setAllCommandes([]);
    }
  }, [token]); 

  // ... (useMemo pour commandesAffichees est inchangé) ...
  const commandesAffichees = useMemo(() => {
    let filtered = [...allCommandes];
    const lowerStatusFilter = statusFilter.toLowerCase();
    if (lowerStatusFilter === 'actifs') {
      filtered = filtered.filter(cmd => cmd[cleEtat] && statutsActifs.includes(cmd[cleEtat].trim().toLowerCase()));
    } else if (lowerStatusFilter !== 'tous') {
      filtered = filtered.filter(cmd => cmd[cleEtat] && cmd[cleEtat].trim().toLowerCase() === lowerStatusFilter);
    }
    const lowerSearch = searchTerm.trim().toLowerCase();
    if (lowerSearch === '') return filtered; 
    return filtered.filter(commande => {
      return Object.values(commande).some(valeur => String(valeur).toLowerCase().includes(lowerSearch));
    });
  }, [allCommandes, statusFilter, searchTerm, cleEtat]); 


  // MODIFIÉ : Utilise le token
  const handleStatusChange = async (commandeId, originalRowIndex, newStatus) => {
     setUpdatingStatus(commandeId); 
     setError('');
     try {
         const response = await fetch('http://localhost:3001/api/sheet-data/update-status', {
             method: 'PUT',
             headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // AJOUTÉ
             },
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
         setError(`Erreur mise à jour statut: ${err.message}`);
         setUpdatingStatus(null); 
     } 
  };

  // NOUVEAU : Fonction pour enregistrer l'URL du Google Sheet
  const handleSaveSheetUrl = async (e) => {
    e.preventDefault();
    setUrlSaveMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/user/sheet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ google_sheet_url: sheetUrl })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      // Succès !
      setUrlSaveMessage('Lien enregistré ! Rechargement des commandes...');

      // 1. Met à jour l'objet utilisateur dans App.jsx
      if (typeof onUserUpdate === 'function') {
        const updatedUser = { ...user, google_sheet_url: sheetUrl };
        onUserUpdate(updatedUser);
        // Met aussi à jour le localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // 2. Recharge les commandes
      setTimeout(() => {
        setLoading(true);
        fetchCommandes(); 
        setUrlSaveMessage('');
      }, 1500);

    } catch (err) {
      setUrlSaveMessage(`Erreur lors de l'enregistrement: ${err.message}`);
    }
  };


  // --- AFFICHAGE (MODIFIÉ) ---
  return (
    <div className="commandes-page-content">
      <h1>
        Commandes Actives
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
      
      {/* NOUVEAU : Gère l'erreur d'URL manquante */}
      {error && (
        <div className="error-box" style={{ padding: '20px', background: '#fff', borderRadius: '8px', margin: '20px 0' }}>
          <p className="error-message" style={{ color: '#d93025' }}>{error}</p>
          
          {/* Affiche le formulaire SEULEMENT si c'est l'erreur d'URL manquante */}
          {error.includes("Aucun lien Google Sheet") && (
            <form onSubmit={handleSaveSheetUrl} className="sheet-url-form">
              <h4 style={{ marginTop: '0' }}>Configurer votre lien Google Sheet</h4>
              <p>Pour {user?.username}, collez l'URL complète de votre feuille de commandes :</p>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                style={{ width: '90%', marginBottom: '10px', padding: '8px' }}
              />
              <button type="submit" style={{ padding: '8px 12px' }}>Enregistrer et Charger</button>
              {urlSaveMessage && <p style={{ marginTop: '10px' }}>{urlSaveMessage}</p>}
            </form>
          )}
        </div>
      )}

      {/* N'affiche les commandes que si pas de chargement ET pas d'erreur */}
      {!loading && !error && (
        <div className="commandes-list-container">
          {commandesAffichees.length > 0 ? (
            commandesAffichees.map((commande) => {
              
              const currentStatusClass = (commande[cleEtat] || 'inconnu').trim().toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/\s+/g, '-'); 
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