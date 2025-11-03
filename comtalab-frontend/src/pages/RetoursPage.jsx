// src/pages/RetoursPage.jsx (Simplifié et Corrigé)
import React, { useState, useEffect, useMemo } from 'react';
import './StockPage.css'; // On réutilise le MÊME CSS de base
import './RetoursPage.css'; // On importe le CSS pour le look "fluide"

// --- Structure des données articleDetails ---
const articleDetails = {
  'tshirt': {
    display: 'T-shirt',
    aliases: ['t shirt', 't-shirt'],
    styles: ['oversize', 'oversize premium', 'regular premium', 'regular', 'enfant']
  },
  'hoodie': {
    display: 'Hoodie',
    aliases: ['sweat'],
    styles: ['premium', 'enfant', 'standard', 'oversize']
  },
  'jogging': {
    display: 'Jogging',
    aliases: [],
    styles: ['oversize elastiqué', 'elastiqué normal', 'open leg']
  },
  'sac a dos': {
    display: 'Sac à dos',
    aliases: ['sacados', 'sac à dos'],
    styles: ['standard', 'premium']
  },
  'autre': {
    display: 'Autre',
    aliases: [],
    styles: []
  }
};
// --- FIN Structure ---


// --- Composant Formulaire (Modifié pour /api/retours) ---
function AddRetourItemForm({ onRetourAdded, token }) {
  const nomsDeBaseKeys = Object.keys(articleDetails);
  const [nom, setNom] = useState(''); // 'tshirt', 'hoodie', 'autre'
  const [style, setStyle] = useState(''); // 'oversize', 'premium'
  const [taille, setTaille] = useState(''); // 'S', 'M'
  const [couleur, setCouleur] = useState(''); // 'Noir'
  const [description, setDescription] = useState(''); // 'Hoodie Luffy' (le nom spécifique)
  const [formError, setFormError] = useState('');

  const couleursSuggerees = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Beige'];

  const isAutreMode = nom === 'autre';
  const isSacADos = nom === 'sac a dos';
  const isTailleRequired = nom !== 'autre' && nom !== 'sac a dos';
  const isCouleurRequired = !isAutreMode;
  const isTailleDisabled = isSacADos;

  const stylesDisponibles = useMemo(() => (nom && !isAutreMode ? articleDetails[nom]?.styles || [] : []), [nom, isAutreMode]);

  const handleNomChange = (selectedNom) => {
    setNom(selectedNom);
    setStyle('');
    setDescription('');
    if (selectedNom === 'sac a dos') {
      setTaille('Unique');
    } else {
      setTaille('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nomFinal = nom; // 'tshirt', 'hoodie', 'autre'
    const styleFinal = isAutreMode ? null : (style || null);
    const tailleAEnvoyer = isSacADos ? 'Unique' : (taille || null);
    const couleurAEnvoyer = isCouleurRequired ? couleur : (couleur || null);
    const descriptionFinale = description || null; // Le nom spécifique

    let validationError = "";
    if (!nomFinal) validationError = '"Catégorie"';
    else if (isTailleRequired && !taille) validationError = '"Taille"';
    else if (isCouleurRequired && !couleur) validationError = '"Couleur"';
    else if (!descriptionFinale) validationError = '"Description (Modèle)"'; // Description est TOUJOURS requise

    if (validationError) {
      setFormError(`Veuillez remplir le champ ${validationError}.`);
      return;
    }

    // Si ce n'est pas 'autre', mais qu'on a pas de style (ex: T-shirt simple)
    if (!isAutreMode && stylesDisponibles.length > 0 && !styleFinal) {
      setFormError("Veuillez choisir un style (ou 'standard'/'regular' s'il n'y en a pas).");
      return;
    }

    const newItem = {
      nom: nomFinal, // 'tshirt', 'hoodie', 'autre'
      taille: tailleAEnvoyer,
      couleur: couleurAEnvoyer,
      style: styleFinal, // 'oversize', 'premium', 'null'
      description: descriptionFinale // 'Hoodie Luffy', 'T-shirt Naruto'
    };

    try {
      console.log('Envoi au backend (retours):', newItem);
      const response = await fetch('http://localhost:3001/api/retours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        console.log('Retour ajouté !');
        setNom(''); setTaille(''); setCouleur(''); setStyle(''); setDescription('');
        if (typeof onRetourAdded === 'function') { onRetourAdded(); }
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || `Erreur ${response.status}.`);
        console.error('Erreur backend:', errorData);
      }
    } catch (err) {
      setFormError('Erreur réseau.');
      console.error('Erreur fetch:', err);
    }
  };

  const taillesSuggereesFinales = useMemo(() => {
    const isTailleEnfantMode = style === 'enfant' && ['tshirt', 'hoodie'].includes(nom);
    if (isSacADos) return ['Unique'];
    if (isTailleEnfantMode) return ['6 ans', '8 ans', '10 ans', '12 ans', '14 ans'];
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'];
  }, [nom, style, isSacADos]);

  return (
    <form className="add-stock-form horizontal-form" onSubmit={handleSubmit}>
      {formError && <p className="error-message">{formError}</p>}

      {/* Champ 1: Catégorie */}
      <div className="form-control-stock"> <label>Catégorie*:</label> <select value={nom} onChange={e => handleNomChange(e.target.value)} required> <option value="" disabled>-- Choisir --</option> {nomsDeBaseKeys.map(n => <option key={n} value={n}>{articleDetails[n].display}</option>)} </select> </div>

      {/* Champ 2: Description (Modèle) - NOUVEAU */}
      <div className="form-control-stock">
        <label>Description (Modèle)*:</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Hoodie Luffy, T-shirt Real Madrid" required />
      </div>

      {/* Champ 3: Style (Optionnel, sauf si 'autre' est sélectionné) */}
      {!isAutreMode && (
        <div className="form-control-stock">
          <label>Style:</label>
          <select value={style} onChange={e => setStyle(e.target.value)} required={stylesDisponibles.length > 0} disabled={!nom || stylesDisponibles.length === 0}>
            <option value="">-- {nom ? (stylesDisponibles.length > 0 ? 'Choisir style' : 'Aucun') : 'Choisir article'} --</option>
            {stylesDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* Champ 4: Taille */}
      <div className="form-control-stock"> <label>{isTailleRequired ? "Taille*:" : "Taille (Optionnel):"}</label> <input type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder={isSacADos ? "Unique" : "S, M, L..."} required={isTailleRequired} list="tailles" disabled={isTailleDisabled} /> <datalist id="tailles"> {taillesSuggereesFinales.map(t => <option key={t} value={t} />)} </datalist> </div>

      {/* Champ 5: Couleur */}
      <div className="form-control-stock">
        <label>{isCouleurRequired ? "Couleur*:" : "Couleur (Optionnel):"}</label>
        <input type="text" value={couleur} onChange={e => setCouleur(e.target.value)} placeholder="Noir, Blanc..." required={isCouleurRequired} list="couleurs" disabled={!nom} />
        <datalist id="couleurs"> {couleursSuggerees.map(c => <option key={c} value={c} />)} </datalist>
      </div>

      <button type="submit" className="btn-submit-stock" disabled={!nom}>Ajouter 1 Retour</button>
    </form>
  );
}
// --- FIN Formulaire ---


// --- Composant Page Principale ---
function RetoursPage({ token }) {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleFilter, setArticleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  // const [showAddForm, setShowAddForm] = useState(true); // Formulaire toujours visible

  const fetchStock = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/retours', {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        let errorMsg = `Erreur réseau ou serveur (${response.status})`;
        try {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) { errorMsg = "Session expirée."; }
          else { errorMsg = errorData.error || errorMsg; }
        } catch(jsonError) { /* ignore */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setStockItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Impossible de charger les retours: " + err.message);
      setStockItems([]);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (token) { fetchStock(); }
    else {
      setLoading(false);
      setError("Veuillez vous connecter pour voir les retours.");
      setStockItems([]);
    }
  }, [token]);

  // MODIFIÉ : S'appelle maintenant handleDeleteItem
  const handleDeleteItem = async (itemId, itemTitle) => {
    if (!window.confirm(`Es-tu sûr de vouloir supprimer cet article en retour ?\n\n"${itemTitle}"\n\nAction irréversible !`)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/retours/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();

      if (response.ok) {
        console.log(result.message || `Article supprimé.`);
        fetchStock(); // Rafraîchit la liste
      } else {
        alert(`Erreur suppression: ${result.error || 'Erreur inconnue.'}`);
        console.error('Erreur DELETE Item:', result);
      }
    } catch (err) {
      alert('Erreur réseau suppression.');
      console.error('Erreur fetch DELETE Item:', err);
    }
  };


  // --- 1. MODIFIÉ : On ne groupe plus. On filtre. ---
  const filteredRetours = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const articleOrder = ['tshirt', 'hoodie', 'jogging', 'sac a dos', 'autre'];

    return stockItems
      .map(item => {
        // Construit le nom complet de l'article
        const baseInfo = articleDetails[item.nom] || { display: 'Autre' };
        let displayName = '';

        if (item.nom === 'autre') {
          displayName = item.description || item.style || 'Article inconnu'; // Utilise description si disponible, sinon style
        } else {
          displayName = item.description || baseInfo.display; // Priorité à la description
          if (item.style && item.style !== 'standard') displayName += ` ${item.style}`;
        }

        if (item.couleur) displayName += ` ${item.couleur}`;
        if (item.taille && item.taille !== 'Unique') displayName += ` ${item.taille}`;

        return {
          ...item,
          fullDescription: displayName.trim(),
          baseCategory: item.nom // 'tshirt', 'hoodie', etc.
        };
      })
      .filter(item => {
        // 1. Filtre par Catégorie
        const categoryMatch = (articleFilter === 'all') || (item.baseCategory === articleFilter);
        if (!categoryMatch) return false;

        // 2. Filtre par Recherche
        if (term === '') return true;
        return item.fullDescription.toLowerCase().includes(term);
      })
      .sort((a, b) => { // Tri par catégorie de base
        const indexA = articleOrder.indexOf(a.baseCategory);
        const indexB = articleOrder.indexOf(b.baseCategory);
        if (indexA !== indexB) return indexA - indexB;
        return a.fullDescription.localeCompare(b.fullDescription); // Puis alphabétique
      });

  }, [stockItems, articleFilter, searchTerm]);
  // --- FIN MODIFICATION ---

  // --- Les useMemos pour les totaux et le tri sont SUPPRIMÉS ---

  // --- Formatage Argent (inchangé) ---
  const formatArgent = (nombre) => {
    if (typeof nombre !== 'number' || isNaN(nombre)) {
      return '0 DZD';
    }
    return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';
  };

  // --- RENDER (Totalement modifié) ---
  return (
    <div className="stock-page-content retours-page">
      <h2>Gestion des Retours</h2>

      {/* Le formulaire est TOUJOURS visible */}
      <AddRetourItemForm onRetourAdded={fetchStock} token={token} />

      <hr className="stock-divider"/>

      <div className="stock-filters">
        <input type="text" placeholder="Rechercher par nom, style, couleur, taille..." className="filter-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="filter-article-select" value={articleFilter} onChange={(e) => setArticleFilter(e.target.value)}>
          <option value="all">Toutes les catégories</option>
          {Object.keys(articleDetails).map(key => ( <option key={key} value={key}>{articleDetails[key].display}</option> ))}
        </select>
      </div>

      <h3>Récapitulatif des Retours ({filteredRetours.length} articles)</h3>

      {loading ? (
        <p>Chargement des retours...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="stock-content-wrapper">

          {/* --- NOUVELLE VUE : LISTE FLUIDE --- */}
          <div className="retours-list-container">
            {filteredRetours.length > 0 ? (
              filteredRetours.map(item => {

                return (
                  <div key={item.id} className="retour-item-card">
                    <h5>
                      {item.fullDescription}
                      <button
                        onClick={() => handleDeleteItem(item.id, item.fullDescription)}
                        className="btn-delete-group"
                        title="Supprimer cet article"
                      >
                        🗑️
                      </button>
                    </h5>
                  </div>
                );
              })
            ) : (
              <p className="empty-summary-message">
                {stockItems.length > 0 ? "Aucun article ne correspond à votre recherche ou filtre." : "Votre stock de retours est vide."}
              </p>
            )}
          </div>
          {/* --- FIN NOUVELLE VUE --- */}

          {/* Le résumé global est SUPPRIMÉ */}

        </div>
      )}
    </div>
  );
}

export default RetoursPage;