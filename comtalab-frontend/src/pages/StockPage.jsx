// src/pages/StockPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './StockPage.css';

// --- Structure des données articleDetails ---
const articleDetails = {
  't shirt': { display: 'T-shirt', styles: ['oversize', 'oversize premium', 'regular premium', 'regular', 'enfant'], prix: { 'oversize': 950, 'oversize premium': 1150, 'regular premium': 790, 'regular': 620, 'enfant': 620 } },
  'hoodie': { display: 'Hoodie', styles: ['orma premium', 'enfant', 'standard'], prix: { 'orma premium': 1650, 'enfant': 1300, 'standard': 1260 } },
  'jogging': { display: 'Jogging', styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 } },
  'sac a dos': { display: 'Sac à dos', styles: ['standard', 'premium'], prix: { 'standard': 1150, 'premium': 1220 } },
  'autre': { display: 'Autre', styles: [], prix: {} }
};
// --- FIN Structure ---


// --- Composant Formulaire AddStockItemForm ---
function AddStockItemForm({ onStockAdded }) {
  const nomsDeBaseKeys = Object.keys(articleDetails);
  const [nom, setNom] = useState('');
  const [style, setStyle] = useState('');
  const [taille, setTaille] = useState('');
  const [couleur, setCouleur] = useState('');
  const [quantite, setQuantite] = useState(0);
  const [formError, setFormError] = useState('');

  const taillesSuggerees = ['S', 'M', 'L', 'XL', 'XXL', '6 ans', '8 ans', '10 ans', '12 ans', 'XS', 'Unique'];
  const couleursSuggerees = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Beige'];

  const isAutreMode = nom === 'autre';
  const isSacADos = nom === 'sac a dos';
  const isTailleRequired = nom !== 'autre' && nom !== 'sac a dos';
  const isTailleDisabled = isSacADos;

  const stylesDisponibles = useMemo(() => (nom && !isAutreMode ? articleDetails[nom]?.styles || [] : []), [nom, isAutreMode]);

  const prixAffiche = useMemo(() => {
    if (nom && !isAutreMode && style && articleDetails[nom]?.prix?.[style]) {
        const basePrice = articleDetails[nom].prix[style];
        if (nom === 'hoodie' && style === 'enfant' && ['S', 'M', 'L', 'XL', 'XXL'].includes(taille.toUpperCase())) { return 1650; }
        return basePrice;
    }
    return null;
  }, [nom, style, taille, isAutreMode]);

  const handleNomChange = (selectedNom) => {
    setNom(selectedNom);
    setStyle('');
    if (selectedNom === 'sac a dos') {
        setTaille('Unique');
    } else {
        setTaille('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('');
    const nomFinal = isAutreMode ? style : nom;
    const styleFinal = isAutreMode ? null : style;
    const quantiteParsed = parseInt(quantite);
    const tailleAEnvoyer = isSacADos ? 'Unique' : (taille || null);
    
    if (!nomFinal || (isTailleRequired && !taille) || !couleur || isNaN(quantiteParsed) || quantiteParsed < 0) {
      setFormError(`Veuillez remplir ${isAutreMode ? '"Nom d\'article"' : '"Article"'} ${isTailleRequired ? ', "Taille"' : ''} et "Couleur" avec une quantité >= 0.`); return;
    }
     if (!isAutreMode && stylesDisponibles.length > 0 && !styleFinal && nomFinal !== 'autre') {
        setFormError("Veuillez choisir un style pour cet article."); return;
     }

    const newItem = { nom: nomFinal, taille: tailleAEnvoyer, couleur, style: styleFinal, quantite: quantiteParsed };

    try {
      const response = await fetch('http://localhost:3001/api/stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem), });
      if (response.ok) {
        alert('Article ajouté/quantité mise à jour !');
        setNom(''); setTaille(''); setCouleur(''); setStyle(''); setQuantite(0);
        if (typeof onStockAdded === 'function') { onStockAdded(); }
      } else {
        const errorData = await response.json(); setFormError(errorData.error || `Erreur ${response.status}.`);
      }
    } catch (err) { setFormError('Erreur réseau.'); console.error(err); }
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
      <div className="form-control-stock"> <label>Article*:</label> <select value={nom} onChange={e => handleNomChange(e.target.value)} required> <option value="" disabled>-- Choisir --</option> {nomsDeBaseKeys.map(n => <option key={n} value={n}>{articleDetails[n].display}</option>)} </select> </div>
      <div className="form-control-stock"> <label>{isAutreMode ? "Nom d'article*:" : "Style:"}</label> {isAutreMode ? ( <input type="text" value={style} onChange={e => setStyle(e.target.value)} placeholder="Nom du nouvel article" required /> ) : ( <select value={style} onChange={e => setStyle(e.target.value)} required={stylesDisponibles.length > 0 && nom !== 'autre'} disabled={!nom || stylesDisponibles.length === 0}> <option value="">-- {nom ? (stylesDisponibles.length > 0 ? 'Choisir style' : 'Aucun') : 'Choisir article'} --</option> {stylesDisponibles.map(s => <option key={s} value={s}>{s}</option>)} </select> )} </div>
      <div className="form-control-stock"> <label>{isTailleRequired ? "Taille*:" : "Taille (Optionnel):"}</label> <input type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder={isSacADos ? "Unique" : "S, M, L..."} required={isTailleRequired} list="tailles" disabled={isTailleDisabled} /> <datalist id="tailles"> {taillesSuggereesFinales.map(t => <option key={t} value={t} />)} </datalist> </div>
      <div className="form-control-stock"> <label>Couleur*:</label> <input type="text" value={couleur} onChange={e => setCouleur(e.target.value)} placeholder="Noir, Blanc..." required list="couleurs" disabled={!nom}/> <datalist id="couleurs"> {couleursSuggerees.map(c => <option key={c} value={c} />)} </datalist> </div>
      <div className="form-control-stock quantity-input"> <label>Qté*:</label> <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} min="0" required disabled={!nom}/> </div>
      <div className="form-control-stock price-display"> <label>Prix:</label> <input type="text" value={prixAffiche !== null ? `${prixAffiche} DZD` : '-'} readOnly disabled /> </div>
      <button type="submit" className="btn-submit-stock" disabled={!nom}>Ajouter</button>
    </form>
  );
}
// --- FIN Formulaire ---


// --- Composant Page Principale ---
function StockPage() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleFilter, setArticleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStock = async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/stock', { cache: 'no-store' });
      if (!response.ok) {
        let errorMsg = `Erreur réseau ou serveur (${response.status})`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch(jsonError) { /* ignore */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setStockItems(Array.isArray(data) ? data : []);
    } catch (err) { setError("Impossible de charger le stock: " + err.message); setStockItems([]); }
     finally { setLoading(false); }
  };
  useEffect(() => { fetchStock(); }, []);

  const handleQuantityChange = async (itemId, currentQuantity, change) => {
      const newQuantity = currentQuantity + change;
      if (newQuantity < 0) return;
      try {
        const response = await fetch(`http://localhost:3001/api/stock/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantite: newQuantity }), });
        if (response.ok) {
          const updatedData = await response.json();
          setStockItems(prevItems => Array.isArray(prevItems) ? prevItems.map(item => item.id === updatedData.id ? { ...item, quantite: updatedData.quantite } : item ) : []);
        } else { alert('Erreur MàJ quantité (serveur).'); }
      } catch (err) { alert('Erreur MàJ quantité (réseau).'); console.error(err); }
   };

  const handleDeleteGroup = async (groupInfo) => {
      let cardTitle = groupInfo.displayNom;
      if (groupInfo.displayStyle && groupInfo.displayStyle !== 'standard' && !groupInfo.displayNom.startsWith('autre-')) { cardTitle += ` - ${groupInfo.displayStyle}`; }
      cardTitle += ` - ${groupInfo.displayCouleur}`;
      const nomKey = Object.keys(articleDetails).find(k => articleDetails[k].display === groupInfo.displayNom) || groupInfo.displayNom;
      const styleKey = groupInfo.displayStyle === 'standard' ? '' : groupInfo.displayStyle;
      if (!window.confirm(`Es-tu sûr de vouloir supprimer TOUS les articles "${cardTitle}" ?\nAction irréversible !`)) return;
      const url = `http://localhost:3001/api/stock/group?nom=${encodeURIComponent(nomKey)}&couleur=${encodeURIComponent(groupInfo.displayCouleur)}${styleKey ? `&style=${encodeURIComponent(styleKey)}` : ''}`;
      try {
          const response = await fetch(url, { method: 'DELETE' });
          if (response.ok || response.status === 404) { alert(`Groupe "${cardTitle}" supprimé.`); fetchStock(); }
          else { const errorData = await response.json(); alert(`Erreur suppression groupe: ${errorData.error || response.status}`); }
      } catch (err) { alert('Erreur réseau suppression groupe.'); console.error(err); }
  };


  // --- LOGIQUE POUR LES CARTES ET LE RÉSUMÉ GLOBAL (CORRIGÉE) ---
  const { stockSummaryByVariation, totalItemsByCategory, totalGlobalQuantity, totalGlobalValue, valueByArticle } = useMemo(() => {
    // Déclare toutes les variables ici
    const summary = {};
    const totalsByCategory = {}; 
    const valueByArticle = {};
    let globalTotalQuantity = 0;
    let globalTotalValue = 0; 

    // Retourne l'objet vide si stockItems n'est pas prêt
    if (!Array.isArray(stockItems)) {
        return { stockSummaryByVariation: summary, totalItemsByCategory: totalsByCategory, totalGlobalQuantity: 0, totalGlobalValue: 0, valueByArticle: {} };
    }

    stockItems.forEach(item => {
      const baseKey = Object.keys(articleDetails).find(key => key === item.nom) || 'autre';
      const couleur = item.couleur || 'Inconnue';
      let groupKey = ''; let displayNom = ''; let displayStyle = item.style || 'standard'; let displayCouleur = couleur;

      if (baseKey === 'autre') {
          const customNom = item.nom === 'autre' ? item.style || `Inconnu ID ${item.id}` : item.nom;
          groupKey = `autre-${customNom}-${couleur}`; displayNom = customNom; displayStyle = '';
      } else {
          groupKey = `${item.nom}-${displayStyle}-${couleur}`; displayNom = articleDetails[baseKey]?.display || item.nom;
      }

      if (!summary[groupKey]) { summary[groupKey] = { displayNom, displayStyle, displayCouleur, totalQuantity: 0, quantitiesByTaille: {} }; }

      // Calcule le prix unitaire
      let unitPrice = 0;
      if (!baseKey.startsWith('autre')) {
        const styleToLook = item.style || 'standard';
        const articleData = articleDetails[baseKey];
        unitPrice = articleData?.prix?.[styleToLook] || 0;
        if (baseKey === 'hoodie' && item.style === 'enfant' && ['S', 'M', 'L', 'XL', 'XXL'].includes((item.taille || '').toUpperCase())) { unitPrice = 1650; }
      }
      const variationValue = unitPrice * item.quantite;

      // Mise à jour des totaux
      summary[groupKey].totalQuantity += item.quantite;
      globalTotalQuantity += item.quantite;
      globalTotalValue += variationValue; 

      const articleDisplayName = articleDetails[baseKey]?.display || 'Autre';
      
      totalsByCategory[articleDisplayName] = (totalsByCategory[articleDisplayName] || 0) + item.quantite;
      valueByArticle[articleDisplayName] = (valueByArticle[articleDisplayName] || 0) + variationValue;

      const taille = item.taille || 'Unique';
      summary[groupKey].quantitiesByTaille[taille] = { id: item.id, quantite: (summary[groupKey].quantitiesByTaille[taille]?.quantite || 0) + item.quantite };
    });

    // Retourne l'objet complet
    return { stockSummaryByVariation: summary, totalItemsByCategory: totalsByCategory, totalGlobalQuantity: globalTotalQuantity, totalGlobalValue: globalTotalValue, valueByArticle: valueByArticle };
  }, [stockItems]);
  // --- FIN LOGIQUE CARTES ET VALEUR ---

  // Ordre principal des types d'articles
  const articleOrder = ['t shirt', 'hoodie', 'jogging', 'sac a dos', 'autre'];

  // Fonction utilitaire pour le formatage monétaire
  const formatArgent = (nombre) => new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';

  // Fonction pour obtenir les clés triées pour UN type d'article donné
  const getSortedKeysForArticle = (articleBaseKey) => {
      return Object.keys(stockSummaryByVariation)
          .filter(key => {
              if (articleBaseKey === 'autre') { return key.startsWith('autre-'); }
              return key.startsWith(`${articleBaseKey}-`);
          })
          .filter(key => stockSummaryByVariation[key]?.totalQuantity > 0)
          .sort((keyA, keyB) => {
              const partsA = keyA.split('-'); const partsB = keyB.split('-');
              const styleA = partsA[1]; const styleB = partsB[1];
              if (styleA !== styleB) return styleA.localeCompare(styleB);
              const couleurA = partsA[2]; const couleurB = partsB[2];
              return couleurA.localeCompare(couleurB);
          });
  };


  // --- LOGIQUE DE FILTRAGE DES CARTES ---
  const filteredDisplayKeys = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return Object.keys(stockSummaryByVariation)
      .filter(key => stockSummaryByVariation[key]?.totalQuantity > 0) // Filtre Qté > 0
      .filter(key => { // Filtre Dropdown
          if (articleFilter === 'all') return true;
          if (articleFilter === 'autre') return key.startsWith('autre-');
          return key.startsWith(`${articleFilter}-`);
      })
      .filter(key => { // Filtre Recherche
          if (term === '') return true;
          const summary = stockSummaryByVariation[key];
          let cardTitle = summary.displayNom;
          if (summary.displayStyle && summary.displayStyle !== 'standard' && !key.startsWith('autre-')) { cardTitle += ` ${summary.displayStyle}`; }
          else if (key.startsWith('autre-')) { cardTitle = summary.displayNom; }
          cardTitle += ` ${summary.displayCouleur}`;
          if (cardTitle.toLowerCase().includes(term)) return true;
          const hasMatchingTaille = Object.keys(summary.quantitiesByTaille).some( taille => taille.toLowerCase().includes(term) );
          if (hasMatchingTaille) return true;
          return false;
      })
      .sort((keyA, keyB) => { // Tri final
          const partsA = keyA.split('-'); const partsB = keyB.split('-');
          const indexA = articleOrder.indexOf(partsA[0]); const indexB = articleOrder.indexOf(partsB[0]);
          const effectiveIndexA = indexA === -1 ? Infinity : indexA; const effectiveIndexB = indexB === -1 ? Infinity : indexB;
          if (effectiveIndexA !== effectiveIndexB) { return effectiveIndexA - effectiveIndexB; }
          const styleA = partsA[1]; const styleB = partsB[1];
          if (styleA !== styleB) return styleA.localeCompare(styleB);
          const couleurA = partsA[2]; const couleurB = partsB[2];
          return couleurA.localeCompare(couleurB);
      });
  }, [stockSummaryByVariation, articleFilter, searchTerm]);
  // --- FIN LOGIQUE FILTRAGE ---


  return (
    <div className="stock-page-content">
      <h2>Gestion du Stock</h2>
      <AddStockItemForm onStockAdded={fetchStock} />
      <hr className="stock-divider"/>

      {/* --- Section Filtres --- */}
      <div className="stock-filters">
        <input type="text" placeholder="Rechercher par nom, style, couleur, taille..." className="filter-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="filter-article-select" value={articleFilter} onChange={(e) => setArticleFilter(e.target.value)}>
          <option value="all">Tous les articles</option>
          {articleOrder.map(key => ( <option key={key} value={key}>{articleDetails[key]?.display || key}</option> ))}
        </select>
      </div>
      {/* --- FIN FILTRES --- */}
      
      <h3>Récapitulatif Détaillé du Stock</h3>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Chargement du stock...</p>}

      {!loading && !error && (
        <div className="stock-sections-container">
          {articleOrder.map(articleKey => {
            const variationKeys = getSortedKeysForArticle(articleKey);
            const displayedKeysInSection = variationKeys.filter(key => filteredDisplayKeys.includes(key));
            
            if (displayedKeysInSection.length === 0) return null;
            // Calcule le total en pièces pour cette section
            const totalArticleQuantity = displayedKeysInSection.reduce((sum, key) => sum + (stockSummaryByVariation[key]?.totalQuantity || 0), 0);

            return (
              <section key={articleKey} className="article-section">
                <h4 className="article-section-title">
                  {articleDetails[articleKey]?.display || 'Autres Articles'}
                  <span>({totalArticleQuantity} pcs)</span>
                </h4>
                <div className="stock-summary-grid">
                  {displayedKeysInSection.map(key => {
                    const variationSummary = stockSummaryByVariation[key];
                    if (!variationSummary) return null; // Sécurité
                    let cardTitle = variationSummary.displayNom;
                    if (variationSummary.displayStyle && variationSummary.displayStyle !== 'standard' && !key.startsWith('autre-')) { cardTitle += ` - ${variationSummary.displayStyle}`; }
                    cardTitle += ` - ${variationSummary.displayCouleur}`;

                    return (
                      <div key={key} className="article-summary-card">
                        <h5>
                          {cardTitle}
                          <span>({variationSummary.totalQuantity} pcs)</span>
                          <button onClick={() => handleDeleteGroup(variationSummary)} className="btn-delete-group" title="Supprimer tout ce groupe">🗑️</button>
                        </h5>
                        <ul className="variation-list size-only-list">
                          {Object.entries(variationSummary.quantitiesByTaille)
                            .filter(([_, data]) => data.quantite > 0)
                            .sort(([tailleA], [tailleB]) => {
                                const order = ['6 ans', '8 ans', '10 ans', '12 ans', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique', '-'];
                                return order.indexOf(tailleA) - order.indexOf(tailleB);
                            })
                            .map(([taille, data]) => (
                              <li key={taille}>
                                <span className="variation-details">{taille}</span>
                                <span className="variation-quantity-controls">
                                  <button onClick={() => handleQuantityChange(data.id, data.quantite, -1)} disabled={data.quantite <= 0}>-</button>
                                  <span className="variation-quantity">{data.quantite}</span>
                                  <button onClick={() => handleQuantityChange(data.id, data.quantite, 1)}>+</button>
                                </span>
                              </li>
                            ))}
                           {Object.values(variationSummary.quantitiesByTaille).every(data => data.quantite <= 0) && <li className="no-stock-message">Aucun stock</li> }
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {/* Message si tout est vide */}
          {Object.keys(stockSummaryByVariation).every(key => stockSummaryByVariation[key]?.totalQuantity === 0) && (
             <p className="empty-summary-message">Le stock est vide.</p>
          )}

          {/* --- SECTION 2 : RÉSUMÉ GLOBAL EN BAS --- */}
          <div className="stock-global-summary">
             <h4>Totaux et Valeur de l'Inventaire</h4>
             
             <div className="summary-line total">
                 <span>Total général des pièces :</span>
                 <span className="summary-value accent">{totalGlobalQuantity} pcs</span>
             </div>
             
             <div className="summary-line total value-line">
                 <span>Valeur totale du stock :</span>
                 <span className="summary-value accent">{formatArgent(totalGlobalValue)}</span>
             </div>
             
             <hr className="summary-divider"/>

             <h5 className="category-summary-title">Détail par Catégorie</h5>
             <div className="category-totals">
                 <div className="category-header category-item">
                    <span>Article</span>
                    <span style={{textAlign: 'right'}}>Quantité</span>
                    <span style={{textAlign: 'right'}}>Valeur</span>
                 </div>
                 {Object.entries(totalItemsByCategory)
                   .sort(([catA], [catB]) => catA.localeCompare(catB))
                   .map(([category, total]) => (
                     <div key={category} className="summary-line category-item">
                         <span>{category} :</span>
                         <span className="summary-value">{total} pcs</span>
                         <span className="category-value">{formatArgent(valueByArticle[category] || 0)}</span>
                     </div>
                   ))}
             </div>
          </div>
          {/* --- FIN SECTION 2 --- */}
        </div>
      )}
    </div>
  );
}

export default StockPage;