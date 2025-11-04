// src/pages/RetoursPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './StockPage.css'; 
import './RetoursPage.css'; 

// --- Structure des données articleDetails (Copie du StockPage pour cohérence) ---
const articleDetails = {
  't shirt': { display: 'T-shirt', styles: ['oversize', 'oversize premium', 'regular premium', 'regular', 'enfant'], aliases: ['t-shirt', 'tshirt'] },
  'hoodie': { display: 'Hoodie', styles: ['orma premium', 'enfant', 'standard'], aliases: ['sweat'] },
  'jogging': { display: 'Jogging', styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], aliases: [] },
  'sac a dos': { display: 'Sac à dos', styles: ['standard', 'premium'], aliases: ['sacados'] },
  'autre': { display: 'Autre', styles: [], aliases: [] }
};
const articleOrder = Object.keys(articleDetails); 


// --- Composant Formulaire AddRetourItemForm (Inchangé, utilise 'token') ---
function AddRetourItemForm({ onRetourAdded, token }) {
  const nomsDeBaseKeys = Object.keys(articleDetails);
  const [nom, setNom] = useState(''); 
  const [style, setStyle] = useState(''); 
  const [taille, setTaille] = useState(''); 
  const [couleur, setCouleur] = useState(''); 
  const [description, setDescription] = useState(''); 
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

    const nomFinal = nom; 
    const styleFinal = isAutreMode ? null : (style || null);
    const tailleAEnvoyer = isSacADos ? 'Unique' : (taille || null);
    const couleurAEnvoyer = isCouleurRequired ? couleur : (couleur || null);
    const descriptionFinale = description || null; 

    let validationError = "";
    if (!nomFinal) validationError = '"Catégorie"';
    else if (isTailleRequired && !taille) validationError = '"Taille"';
    else if (isCouleurRequired && !couleur) validationError = '"Couleur"';
    else if (!descriptionFinale) validationError = '"Description (Modèle)"'; 

    if (validationError) {
      setFormError(`Veuillez remplir le champ ${validationError}.`);
      return;
    }

    if (!isAutreMode && stylesDisponibles.length > 0 && !styleFinal && nomFinal !== 'autre') {
      setFormError("Veuillez choisir un style pour cet article.");
      return;
    }

    const newItem = {
      nom: nomFinal, 
      taille: tailleAEnvoyer,
      couleur: couleurAEnvoyer,
      style: styleFinal, 
      description: descriptionFinale 
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
        alert('Retour ajouté !');
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
    const isTailleEnfantMode = style === 'enfant' && ['t shirt', 'hoodie'].includes(nom);
    if (isSacADos) return ['Unique'];
    if (isTailleEnfantMode) return ['6 ans', '8 ans', '10 ans', '12 ans', '14 ans'];
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'];
  }, [nom, style, isSacADos]);

  return (
    <form className="add-stock-form horizontal-form" onSubmit={handleSubmit}>
      {formError && <p className="error-message">{formError}</p>}

      {/* Champ 1: Catégorie */}
      <div className="form-control-stock"> <label>Catégorie*:</label> <select value={nom} onChange={e => handleNomChange(e.target.value)} required> <option value="" disabled>-- Choisir --</option> {nomsDeBaseKeys.map(n => <option key={n} value={n}>{articleDetails[n].display}</option>)} </select> </div>

      {/* Champ 2: Description (Modèle) */}
      <div className="form-control-stock">
        <label>Description (Modèle)*:</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Hoodie Luffy, T-shirt Real Madrid" required />
      </div>

      {/* Champ 3: Style */}
      <div className="form-control-stock">
        <label>Style:</label>
        <select value={style} onChange={e => setStyle(e.target.value)} required={!isAutreMode && stylesDisponibles.length > 0} disabled={!nom || stylesDisponibles.length === 0}>
          <option value="">-- Choisir style --</option>
          {stylesDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Champ 4: Taille */}
      <div className="form-control-stock"> <label>{isTailleRequired ? "Taille*:" : "Taille (Opt):"}</label> <input type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder={isSacADos ? "Unique" : "S, M, L..."} required={isTailleRequired} list="tailles" disabled={isTailleDisabled} /> <datalist id="tailles"> {taillesSuggereesFinales.map(t => <option key={t} value={t} />)} </datalist> </div>

      {/* Champ 5: Couleur */}
      <div className="form-control-stock">
        <label>{isCouleurRequired ? "Couleur*:" : "Couleur (Opt):"}</label>
        <input type="text" value={couleur} onChange={e => setCouleur(e.target.value)} placeholder="Noir, Blanc..." required={isCouleurRequired} list="couleurs" disabled={!nom} />
        <datalist id="couleurs"> {couleursSuggerees.map(c => <option key={c} value={c} />)} </datalist>
      </div>

      {/* Bouton Ajouter */}
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

  const fetchStock = useCallback(async () => {
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
      setLoading(false); 
    }
  }, [token]);

  useEffect(() => {
    setLoading(true); 
    if (token) { fetchStock(); }
    else {
      setLoading(false);
      setError("Veuillez vous connecter pour voir les retours.");
      setStockItems([]);
    }
  }, [token, fetchStock]);

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

 // RetoursPage.jsx

const handleDeleteModelGroup = async (item) => {
    let cardTitle = `${articleDetails[item.nom]?.display} - T:${item.taille || 'Non spécifiée'} - Modèle:${item.description}`;
    
    if (!window.confirm(`Es-tu sûr de vouloir supprimer TOUS les retours du modèle "${cardTitle}" ?\nCette action est irréversible !`)) { return; }

    try {
        const url = `http://localhost:3001/api/retours/group?nom=${encodeURIComponent(item.nom)}&style=${encodeURIComponent(item.style || '')}&taille=${encodeURIComponent(item.taille || '')}&description=${encodeURIComponent(item.description || '')}`;
        
        const response = await fetch(url, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` } 
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Groupe de retours supprimé avec succès (${result.message}).`);
            
            // --- CORRECTION CRITIQUE : ATTENDRE AVANT LE RECHARGEMENT ---
            // Ajouter un petit délai pour la stabilité de la DB (50ms)
            await new Promise(resolve => setTimeout(resolve, 50)); 
            
            // Recharger l'état du stock DEPUIS LE SERVEUR
            fetchStock(); 
            // ------------------------------------------

        } else {
            const errorData = await response.json();
            alert(`Erreur lors de la suppression du groupe: ${errorData.error || response.status}`);
        }
    } catch (err) { 
        alert('Erreur réseau lors de la suppression du groupe.');
        console.error('Erreur fetch DELETE Retours Group:', err); 
    }
};


  // --- 1. Logique de Filtrage et de Tri ---
  const filteredRetours = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const articleOrderKeys = Object.keys(articleDetails);

    return stockItems
      .map(item => {
        const baseInfo = articleDetails[item.nom] || { display: 'Autre' };
        
        let descriptionBase = item.description || (item.style || item.nom);
        let descriptionFull = descriptionBase;

        if (item.style && item.style !== 'standard') descriptionFull += ` (${item.style})`;
        if (item.couleur) descriptionFull += ` ${item.couleur}`;
        if (item.taille && item.taille !== 'Unique') descriptionFull += ` ${item.taille}`;


        return {
          ...item,
          fullDescription: descriptionFull.trim(),
          baseCategory: item.nom, 
          itemDescription: descriptionBase,
          // Clé unique pour le regroupement de modèle
          groupKey: `${item.nom}-${item.style || ''}-${item.taille || ''}-${item.description || ''}`
        };
      })
      .filter(item => {
        const categoryMatch = (articleFilter === 'all') || (item.baseCategory === articleFilter);
        if (!categoryMatch) return false;

        if (term === '') return true;
        return item.fullDescription.toLowerCase().includes(term) || 
               item.itemDescription.toLowerCase().includes(term);
      })
      .sort((a, b) => { // Tri: Catégorie de base, puis Description
        const indexA = articleOrderKeys.indexOf(a.baseCategory);
        const indexB = articleOrderKeys.indexOf(b.baseCategory);
        if (indexA !== indexB) return indexA - indexB;
        return a.fullDescription.localeCompare(b.fullDescription); 
      });

  }, [stockItems, articleFilter, searchTerm]);

  // --- 2. Logique de Regroupement pour les Cartes : Article -> Taille ---
  const { groupedRetoursByArticle, sortedArticleKeys } = useMemo(() => {
    
    const grouping = filteredRetours.reduce((acc, item) => {
        const articleKey = item.baseCategory;
        const tailleKey = item.taille || 'Taille non spécifiée';
        
        if (!acc[articleKey]) acc[articleKey] = {};
        if (!acc[articleKey][tailleKey]) acc[articleKey][tailleKey] = [];
        
        // Regrouper par Modèle/Description + Couleur pour compter les quantités
        acc[articleKey][tailleKey].push(item);

        return acc;
    }, {});

    // Tri des articles selon l'ordre défini (articleOrder)
    const sortedArticleKeys = articleOrder.filter(key => grouping[key]);

    return { groupedRetoursByArticle: grouping, sortedArticleKeys };
  }, [filteredRetours]);

  // --- RENDER ---
  return (
    <div className="stock-page-content retours-page">
      <h2>Gestion des Retours</h2>

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

          {/* --- NOUVELLE VUE : CARTES DE TAILLE (INSPIRÉE DU STOCK) --- */}
          <div className="retours-sections-container"> 
            
            {filteredRetours.length > 0 ? (
                
                sortedArticleKeys.map(articleKey => {
                    const taillesInArticle = groupedRetoursByArticle[articleKey];
                    const tailleOrder = ['6 ans', '8 ans', '10 ans', '12 ans', '14 ans', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique', 'Taille non spécifiée'];

                    const sortedTailleKeys = Object.keys(taillesInArticle).sort((keyA, keyB) => {
                        return tailleOrder.indexOf(keyA) - tailleOrder.indexOf(keyB);
                    });
                    
                    const totalArticleRetours = sortedTailleKeys.reduce((sum, key) => sum + taillesInArticle[key].length, 0);

                    return (
                        <section key={articleKey} className="article-section">
                            <h4 className="article-section-title">
                                {articleDetails[articleKey]?.display || 'Autres Articles'}
                                <span>({totalArticleRetours} pcs)</span>
                            </h4>
                            
                            <div className="retour-taille-grid">
                            {/* Les cartes sont les tailles */}
                            {sortedTailleKeys.map(tailleKey => {
                                const retoursInTaille = taillesInArticle[tailleKey];
                                
                                // Regroupement final par Description/Modèle/Couleur
                                const finalGrouping = retoursInTaille.reduce((acc, item) => {
                                    const key = `${item.description || item.style}-${item.couleur || ''}`;
                                    if (!acc[key]) acc[key] = { items: [], total: 0, description: item.description, style: item.style, couleur: item.couleur };
                                    acc[key].items.push(item);
                                    acc[key].total++;
                                    return acc;
                                }, {});

                                return (
                                    <div key={tailleKey} className="retour-taille-card">
                                        <h5 className="retour-taille-header">
                                            Taille: {tailleKey}
                                            <span>({retoursInTaille.length} pcs)</span>
                                            {/* Bouton de suppression du modèle/taille */}
                                            <button 
                                                onClick={() => handleDeleteModelGroup(retoursInTaille[0])} 
                                                className="btn-delete-group" 
                                                title={`Supprimer tous les retours en taille ${tailleKey}`}
                                            >
                                                🗑️
                                            </button>
                                        </h5>

                                        <ul className="retour-description-list">
                                            {Object.values(finalGrouping).map((group, index) => (
                                                <li key={index} className="description-item">
                                                    <span className="description-details">
                                                        {group.description || group.style} ({group.couleur})
                                                    </span>
                                                    <span className="description-count">{group.total} pcs</span>
                                                </li>
                                            ))}
                                            {/* Liste des IDs individuels pour suppression rapide (optionnel) */}
                                            {/* {retoursInTaille.map(item => (
                                                <li key={item.id} className="individual-retour">
                                                    <span className="individual-details">{item.description} ({item.couleur})</span>
                                                    <button onClick={() => handleDeleteItem(item.id, item.fullDescription)} className="btn-delete-group-tiny">X</button>
                                                </li>
                                            ))} */}
                                        </ul>
                                    </div>
                                );
                            })}
                            </div>
                        </section>
                    );
                })
                
            ) : (
              <p className="empty-summary-message">
                {stockItems.length > 0 ? "Aucun article ne correspond à votre recherche ou filtre." : "Votre stock de retours est vide."}
              </p>
            )}
          </div>
          {/* --- FIN NOUVELLE VUE --- */}
        </div>
      )}
    </div>
  );
}

export default RetoursPage;