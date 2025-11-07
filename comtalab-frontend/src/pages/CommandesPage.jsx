import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './CommandesPage.css';

// --- Fonction formatArgent ---
const formatArgent = (nombre) => {
  if (typeof nombre !== 'number' || isNaN(nombre)) {
    return '0 DZD';
  }
  return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';
};

// --- Fonction pour formater le JSON des articles ---
const formatArticles = (articlesJson) => {
  try {
    const articles = JSON.parse(articlesJson);
    if (!Array.isArray(articles) || articles.length === 0) return '-';

    return articles.map(art =>
      // Gère le cas où la quantité n'est pas définie (ex: import GSheet)
      `${art.quantite || 1} x ${art.nom || 'Article inconnu'}${art.style ? ` (${art.style})` : ''}`
    ).join(', ');

  } catch (e) {
    // Fallback si ce n'est pas du JSON (ancien format GSheet)
    return articlesJson || '-';
  }
};
// --- FIN ---

// --- Fonction de Normalisation (Globale) ---
const normalizeStatus = (str) => {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[\s\t\-]/g, '') // Supprime les espaces et tirets
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprime les accents
};

function CommandesPage({ token, user, onUserUpdate }) {
  const [allCommandes, setAllCommandes] = useState([]);
  const [loading, setLoading] = useState(true); // Reste true au début
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('actifs');
  const [sheetUrl, setSheetUrl] = useState(user?.google_sheet_url || '');
  const [urlSaveMessage, setUrlSaveMessage] = useState('');
  const [financialSummary, setFinancialSummary] = useState({ gainPotentiel: 0, totalCommandes: 0, totalLivraison: 0, totalCoutArticles: 0 });
  const [manualDTF, setManualDTF] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  // --- Listes de statuts ---
  const statutsActifs = ['en préparation', 'confirmé', 'prêt a livrer', 'echange'];
  const allSelectableStatuses = [
    'En préparation', 'Confirmé', 'Non confirmé',
    'Prêt a livrer',
    'Echange',
    'Envoyé',
    'Annulé'
  ];

  // --- Fonction pour charger les données (DEPUIS LA DB POSTGRES) ---
  const fetchCommandes = useCallback(async (showAlert = false) => {
    // Ne pas mettre 'setError' ici, sinon il s'efface avant 'fetchSummary'
    try {
      const response = await fetch('http://localhost:3001/api/commandes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        let errData = {};
        try { errData = await response.json(); } catch (e) { /* ignore */ }
        if (response.status === 401 || response.status === 403) throw new Error("Session expirée. Veuillez vous reconnecter.");
        throw new Error(errData.error || `Erreur ${response.status}`);
      }

      const commandesFromDB = await response.json();
      setAllCommandes(Array.isArray(commandesFromDB) ? commandesFromDB : []);

      if (showAlert) alert('Commandes rechargées depuis la base de données !');

    } catch (err) {
      console.error("Erreur fetchCommandes (DB):", err);
      setError(`Impossible de charger les commandes : ${err.message}.`);
      setAllCommandes([]);
    } finally {
      setUpdatingStatus(null);
    }
  }, [token]); // <-- CORRECTION : 'loading' retiré

  // --- Fonction pour le résumé financier ---
  const fetchSummary = useCallback(async () => {
    if (!token) return;
    console.log(` -> Appel fetchSummary avec filtre: ${statusFilter}`); // Log de débogage
    const filterParam = encodeURIComponent(statusFilter);
    try {
      const response = await fetch(`http://localhost:3001/api/financial-summary?filter=${filterParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) { throw new Error('Erreur chargement résumé financier'); }
      const data = await response.json();
      setFinancialSummary(data);
    } catch (err) {
      console.error("Erreur fetchSummary:", err);
      setFinancialSummary({ gainPotentiel: 0, totalCommandes: 0, totalLivraison: 0, totalCoutArticles: 0 });
      setError(`Erreur calcul résumé: ${err.message}`); // Affiche l'erreur
    }
  }, [token, statusFilter]);

  // --- Fonction d'Importation (Bouton "Synchroniser") ---
  const handleImport = useCallback(async (showAlert = true) => {
    if (showAlert && !window.confirm("Importer toutes les commandes du Sheet ?\n\nCela effacera et remplacera les commandes actuelles dans la base de données.")) {
      return false;
    }

    setIsImporting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/import-sheets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur inconnue lors de l'importation");
      }

      if (showAlert) alert(data.message);

      // Rafraîchissement complet
      await fetchCommandes();
      await fetchSummary();

      return true;

    } catch (err) {
      console.error("Erreur handleImport:", err);
      setError(`Erreur d'importation: ${err.message}`);
      return false;
    } finally {
      setIsImporting(false);
    }
  }, [token, fetchCommandes, fetchSummary]); // <-- CORRECTION : fetchSummary ajouté


  // --- NOUVEAU useEffect UNIFIÉ ---
  // Gère le chargement initial ET les changements de filtre
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Non connecté.");
      setAllCommandes([]);
      return;
    }

    const loadData = async () => {
      setLoading(true); // Mettre à true au début de CHAQUE chargement
      setError('');

      // 1. On charge toujours le résumé financier (il dépend de statusFilter)
      await fetchSummary();

      // 2. On ne charge la liste complète des commandes que la première fois
      // ou si elle est vide pour une raison quelconque.
      if (allCommandes.length === 0) {
        console.log("Chargement initial des commandes (1 seule fois)...");
        await fetchCommandes();
      }

      setLoading(false); // Mettre à false à la fin
    };

    loadData().catch(err => {
      console.error("Erreur de chargement useEffect:", err);
      setError(`Erreur de chargement : ${err.message}.`);
      setLoading(false);
    });

  // Dépendances : s'exécute si le token change OU si le filtre change
  }, [token, statusFilter, fetchCommandes, fetchSummary, allCommandes.length]);
  // --- FIN DU NOUVEAU useEffect ---


  // Calcul du Gain Net Final (inchangé)
  const gainNetFinal = useMemo(() => {
    const gainBrut = financialSummary.gainPotentiel || 0;
    const dtf = parseFloat(manualDTF) || 0;
    return gainBrut - dtf;
  }, [financialSummary.gainPotentiel, manualDTF]);

  // Commandes affichées (inchangé)
  const commandesAffichees = useMemo(() => {
    let filtered = [...allCommandes];
    const normalizedStatusFilter = normalizeStatus(statusFilter);

    if (normalizedStatusFilter === 'actifs') {
      const normalizedStatutsActifs = statutsActifs.map(s => normalizeStatus(s));
      filtered = filtered.filter(cmd => {
        const etatCmd = normalizeStatus(cmd.etat);
        return etatCmd && normalizedStatutsActifs.includes(etatCmd);
      });
    } else if (normalizedStatusFilter === 'tous') {
      filtered = filtered.filter(cmd => {
        const etatCmd = normalizeStatus(cmd.etat);
        return etatCmd !== 'annule';
      });
    } else {
      // CAS 3: Un filtre spécifique
      filtered = filtered.filter(cmd => {
        const etatCmd = normalizeStatus(cmd.etat);
        return etatCmd === normalizedStatusFilter;
      });
    }

    const lowerSearch = searchTerm.trim().toLowerCase();
    if (lowerSearch === '') return filtered;

    return filtered.filter(commande => {
      return Object.values(commande).some(valeur =>
        String(valeur).toLowerCase().includes(lowerSearch)
      );
    });
  }, [allCommandes, statusFilter, searchTerm, statutsActifs]);

  // --- Mise à jour du statut (VERS LA DB POSTGRES) ---
  const handleStatusChange = async (commandeId, newStatus) => {
    setUpdatingStatus(commandeId);
    setError('');
    try {
      const response = await fetch(`http://localhost:3001/api/commandes/${commandeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ etat: newStatus })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Erreur ${response.status}`);
      }

      // Rafraîchissement léger et rapide
      // 1. Mettre à jour l'état local
      setAllCommandes(prevCommandes =>
        prevCommandes.map(cmd =>
          cmd.id === commandeId ? { ...cmd, etat: newStatus } : cmd
        )
      );

      // 2. Relancer le calcul du résumé
      await fetchSummary();

      setUpdatingStatus(null);

    } catch (err) {
      console.error("Erreur handleStatusChange (DB):", err);
      setError(`Erreur mise à jour statut: ${err.message}`);
      setUpdatingStatus(null);
      // En cas d'erreur, re-fetch tout pour être sûr
      fetchCommandes();
    }
  };

  // handleSaveSheetUrl: (Inchangé)
  const handleSaveSheetUrl = async (e) => {
    e.preventDefault();
    setUrlSaveMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/user/sheet-link', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ googleSheetUrl: sheetUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur inconnue');
      }

      // Succès
      setUrlSaveMessage('Lien enregistré ! Rechargement des commandes...');
      if (typeof onUserUpdate === 'function') {
        const updatedUser = data.user || { ...user, google_sheet_url: sheetUrl };
        onUserUpdate(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Rafraîchissement
      setTimeout(async () => {
        setLoading(true);
        // On relance la synchro complète après avoir ajouté le lien
        await handleImport(false);
        // (handleImport s'occupe déjà de fetchCommandes et fetchSummary)
        setUrlSaveMessage('');
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error("Erreur handleSaveSheetUrl:", err);
      setUrlSaveMessage(`Erreur lors de l'enregistrement: ${err.message}`);
    }
  };




  // --- AFFICHAGE ---
  return (
    <div className="commandes-page-content">
      <h1>
        Commandes Actives (Base de Données)
        {!loading && !error && (
          <span className="commande-count">
            ({commandesAffichees.length})
          </span>
        )}
      </h1>

      {/* --- Bloc de Gain Détaillé --- */}
      {/* On le cache s'il charge OU s'il importe */}
      {(!loading && !isImporting) && (
        <div className="financial-summary-container">

          {/* Ligne 1 : Total Ventes */}
          <div className="summary-line ventes">
            <span>Total Ventes ({statusFilter}) :</span>
            <span className="value-positive">
              {formatArgent(financialSummary.totalCommandes)}
            </span>
          </div>

          {/* Ligne 2 : Coût Livraison */}
          <div className="summary-line">
            <span>(-) Total Coût Livraison :</span>
            <span className="value-negative">
              - {formatArgent(financialSummary.totalLivraison)}
            </span>
          </div>

          {/* Ligne 3 : Coût Articles */}
          <div className="summary-line">
            <span>(-) Total Coût Articles :</span>
            <span className="value-negative">
              - {formatArgent(financialSummary.totalCoutArticles)}
            </span>
          </div>

          {/* Ligne 4 : Bénéfice Brut (Gain Potentiel) */}
          <div className="summary-line brut">
            <span>Bénéfice Brut :</span>
            <span className="value-positive">
              {formatArgent(financialSummary.gainPotentiel)}
            </span>
          </div>

          {/* Ligne 5 : Input pour le DTF */}
          <div className="summary-line dtf-line">
            <label htmlFor="dtfInput">(-) Coût DTF (optionnel) :</label>
            <input
              id="dtfInput"
              type="number"
              value={manualDTF}
              onChange={(e) => setManualDTF(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Ligne 6 : Gain NET FINAL */}
          <div className="summary-line total">
            <span>Gain NET Final :</span>
            <span className="value-positive">
              {formatArgent(gainNetFinal)}
            </span>
          </div>

        </div>
      )}
      {/* --- FIN BLOC DE GAIN --- */}

      <div className="commandes-filters-bar">
        <input
          type="text"
          placeholder="Chercher (nom, tél, articles...)"
          className="commandes-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading || isImporting}
        />
        <select
          className="commandes-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={loading || isImporting}
        >
          <option value="actifs">Commandes Actives (Défaut)</option>
          <option value="tous">Toutes (Sauf Annulées)</option>
          <option disabled>---</option>
          {allSelectableStatuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>



        <button
          onClick={() => handleImport(true)} // On passe 'true' pour l'alerte
          className="btn-import-commandes"
          disabled={isImporting || loading}
        >
          {isImporting ? 'Importation...' : 'Synchroniser les Commandes'}
        </button>

      </div>

      {(loading || isImporting) && <p className="loading-message">{isImporting ? 'Importation en cours...' : 'Chargement...'}</p>}

      {/* --- LE FORMULAIRE D'URL EST ICI --- */}
      {error && (
        <div className="error-box" style={{ padding: '20px', background: '#fff', borderRadius: '8px', margin: '20px 0' }}>
          <p className="error-message" style={{ color: '#d93025' }}>{error}</p>

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
      {/* --- FIN DU BLOC D'ERREUR --- */}

      {!loading && !isImporting && !error && (
        <div className="commandes-list-container">
          {commandesAffichees.length > 0 ? (
            commandesAffichees.map((commande) => {

              const currentStatusClass = (commande.etat || 'inconnu').trim().toLowerCase().replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a').replace(/\s+/g, '-');
              const currentStatusOriginal = commande.etat;
              const cleDateLivraison = 'date_livraison';

              return (
                <div key={commande.id} className={`commande-card status-${currentStatusClass} ${updatingStatus === commande.id ? 'updating' : ''}`}>
                  <div className="card-header">
                    <h3>{commande.nom_prenom || 'Client non spécifié'}</h3>
                    <p>{commande.telephone || '-'}</p>
                  </div>
                  <div className="card-body">
                    <p><strong>Adresse :</strong> {commande.adresse || 'Non spécifiée'}</p>
                    <p><strong>Livraison :</strong> {commande.type_livraison || '-'}</p>
                    <p><strong>Articles :</strong> <strong>{formatArticles(commande.articles)}</strong></p>
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
                      onChange={(e) => handleStatusChange(commande.id, e.target.value)}
                      className={`status-select ${currentStatusClass}`}
                      disabled={updatingStatus === commande.id}
                    >
                      {allSelectableStatuses.map(niceStatus => {
                        const uglyStatusValue = normalizeStatus(niceStatus);

                        return (
                          <option key={uglyStatusValue} value={niceStatus}> {/* Use niceStatus as value to match the state */}
                            {niceStatus}
                          </option>
                        );
                      })}

                      {!allSelectableStatuses.map(s => normalizeStatus(s)).includes(normalizeStatus(currentStatusOriginal)) && (
                        <option key={currentStatusOriginal} value={currentStatusOriginal}>
                          {currentStatusOriginal}
                        </option>
                      )}
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