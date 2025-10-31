// src/pages/CommandesPage.jsx (Complet, avec Gain Détaillé et DTF Manuel)
import React, { useState, useEffect, useMemo } from 'react';
import './CommandesPage.css';

// --- Fonction formatArgent ---
const formatArgent = (nombre) => {
  if (typeof nombre !== 'number' || isNaN(nombre)) {
    return '0 DZD';
  }
  return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';
};
// --- FIN ---

// Fonction pour convertir les lignes du tableau en objets
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

// Accepte 'token', 'user', et 'onUserUpdate' (props d'App.jsx)
function CommandesPage({ token, user, onUserUpdate }) {
  const [allCommandes, setAllCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('actifs');

  const [sheetUrl, setSheetUrl] = useState(user?.google_sheet_url || '');
  const [urlSaveMessage, setUrlSaveMessage] = useState('');

  const [financialSummary, setFinancialSummary] = useState({
    gainPotentiel: 0,
    totalCommandes: 0,
    totalLivraison: 0,
    totalCoutArticles: 0
  });

  const [manualDTF, setManualDTF] = useState(0);

  // --- Listes de statuts ---
  const statutsActifs = ['en préparation', 'confirmé', 'prêt a livrer', 'echange'];
  const allSelectableStatuses = [
    'En préparation', 'Confirmé', 'Non confirmé',
    'Prêt à Livrer', 'Echange', 'Envoyé', 'Annulé'
  ];
  const cleEtat = 'etat_de_livraison';

  // Fonction pour charger les données (utilise le token)
  const fetchCommandes = async (showAlert = false) => {
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/sheet-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 401 || response.status === 403) throw new Error("Session expirée. Veuillez vous reconnecter.");
        if (response.status === 404 && errData.error.includes('Aucun lien Google Sheet')) throw new Error("Aucun lien Google Sheet n'est configuré pour ce compte.");
        throw new Error(errData.error || `Erreur ${response.status}`);
      }
      const rawData = await response.json();
      if (!Array.isArray(rawData) || rawData.length === 0) {
        setAllCommandes([]);
      } else {
        const transformed = transformData(rawData);
        setAllCommandes(transformed);
      }
      if (showAlert) alert('Commandes rechargées !');
    } catch (err) {
      console.error("Erreur fetchCommandes:", err);
      setError(`Impossible de charger les commandes : ${err.message}.`);
      setAllCommandes([]);
    } finally {
      if (loading) setLoading(false);
      setUpdatingStatus(null);
    }
  };

  // Premier chargement (dépend du token)
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

  // useEffect pour le Gain Potentiel (se met à jour avec le filtre)
  useEffect(() => {
    const fetchSummary = async () => {
      if (!token) return;
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
      }
    };
    if (token) {
      fetchSummary();
    }
  }, [token, statusFilter, allCommandes]);

  // Calcul du Gain Net Final
  const gainNetFinal = useMemo(() => {
    const gainBrut = financialSummary.gainPotentiel || 0;
    const dtf = parseFloat(manualDTF) || 0;
    return gainBrut - dtf;
  }, [financialSummary.gainPotentiel, manualDTF]);

  // Logique de filtrage (Corrigée pour les accents)
  const commandesAffichees = useMemo(() => {
    const normalizeStatus = (str) => {
      return (str || '').trim().toLowerCase().replace(/à/g, 'a').replace(/[éèêë]/g, 'e');
    };
    let filtered = [...allCommandes];
    const normalizedStatusFilter = normalizeStatus(statusFilter);
    if (normalizedStatusFilter === 'actifs') {
      const normalizedStatutsActifs = statutsActifs.map(s => normalizeStatus(s));
      filtered = filtered.filter(cmd => {
        const etatCmd = normalizeStatus(cmd[cleEtat]);
        return etatCmd && normalizedStatutsActifs.includes(etatCmd);
      });
    } else if (normalizedStatusFilter !== 'tous') {
      filtered = filtered.filter(cmd => {
        const etatCmd = normalizeStatus(cmd[cleEtat]);
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
  }, [allCommandes, statusFilter, searchTerm, cleEtat]);

  // handleStatusChange
  const handleStatusChange = async (commandeId, originalRowIndex, newStatus) => {
    setUpdatingStatus(commandeId);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/sheet-data/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rowIndex: originalRowIndex, newStatus: newStatus })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Erreur ${response.status}`);
      }
      setTimeout(() => { fetchCommandes(); }, 500);
    } catch (err) {
      console.error("Erreur handleStatusChange:", err);
      setError(`Erreur mise à jour statut: ${err.message}`);
      setUpdatingStatus(null);
    }
  };

  // handleSaveSheetUrl
  const handleSaveSheetUrl = async (e) => {
    e.preventDefault();
    setUrlSaveMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/user/sheet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ google_sheet_url: sheetUrl })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur inconnue');
      setUrlSaveMessage('Lien enregistré ! Rechargement des commandes...');
      if (typeof onUserUpdate === 'function') {
        const updatedUser = { ...user, google_sheet_url: sheetUrl };
        onUserUpdate(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setTimeout(() => {
        setLoading(true);
        fetchCommandes();
        setUrlSaveMessage('');
      }, 1500);
    } catch (err) {
      setUrlSaveMessage(`Erreur lors de l'enregistrement: ${err.message}`);
    }
  };


  // --- AFFICHAGE ---
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

      {/* --- BLOC DE GAIN DÉTAILLÉ --- */}
      {!loading && !error && (
        <div className="financial-summary-container" style={{
          background: '#fff',
          padding: '15px 20px',
          borderRadius: '8px',
          margin: '10px 0 20px 0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          fontSize: '0.95rem'
        }}>

          <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', paddingBottom: '5px' }}>
            <span>Total Ventes ({statusFilter === 'actifs' ? 'Actifs' : statusFilter}) :</span>
            <span style={{ color: 'green' }}>
              {formatArgent(financialSummary.totalCommandes)}
            </span>
          </div>

          <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#555', marginTop: '5px' }}>
            <span>(-) Total Coût Livraison :</span>
            <span style={{ color: '#d93025' }}>
              - {formatArgent(financialSummary.totalLivraison)}
            </span>
          </div>

          <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#555' }}>
            <span>(-) Total Coût Articles :</span>
            <span style={{ color: '#d93025' }}>
              - {formatArgent(financialSummary.totalCoutArticles)}
            </span>
          </div>

          <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.1rem', fontWeight: 'bold', borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px' }}>
            <span>Bénéfice Brut :</span>
            <span style={{ color: '#00bfa5' }}>
              {formatArgent(financialSummary.gainPotentiel)}
            </span>
          </div>

          <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <label htmlFor="dtfInput" style={{ fontWeight: '600', color: '#555' }}>(-) Coût DTF (optionnel) :</label>
            <input
              id="dtfInput"
              type="number"
              value={manualDTF}
              onChange={(e) => setManualDTF(e.target.value)}
              placeholder="ex: 1000"
              style={{ width: '120px', padding: '5px 8px', textAlign: 'right', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
            />
          </div>

          <div className="summary-line total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '2px solid #00bfa5', marginTop: '10px', paddingTop: '10px' }}>
            <span>Gain NET Final :</span>
            <span style={{ color: '#00bfa5' }}>
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
          disabled={loading}
        />
        <select
          className="commandes-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={loading}
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
        <button onClick={() => fetchCommandes(true)} className="btn-refresh-commandes" style={{ padding: '8px 12px', marginLeft: '10px' }}>
          Rafraîchir
        </button>
      </div>

      {loading && <p className="loading-message">Chargement...</p>}

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