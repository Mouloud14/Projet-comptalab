// src/pages/StockPage.jsx (Nettoyé - Sans le Gain Potentiel)
import React, { useState, useEffect, useMemo } from 'react';
import './StockPage.css';

// --- Structure des données articleDetails ---
// (On la remet ici pour que le frontend fonctionne sans 'require')
const articleDetails = {
  't shirt': { display: 'T-shirt', styles: ['oversize', 'oversize premium', 'regular', 'enfant'], prix: { 'oversize': 950, 'oversize premium': 1150, 'regular': 790, 'enfant': 620 } },
  'hoodie': { display: 'Hoodie', styles: ['premium', 'enfant', 'standard'], prix: { 'premium': 1650, 'enfant': 1300, 'standard': 1260 } },
  'jogging': { display: 'Jogging', styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 } },
  'sac a dos': { display: 'Sac à dos', styles: ['standard', 'premium'], prix: { 'standard': 1150, 'premium': 1220 } },
  'autre': { display: 'Autre', styles: [], prix: {} }
};
// --- FIN Structure ---


// --- Composant Formulaire AddStockItemForm ---
function AddStockItemForm({ onStockAdded, token }) {
  const nomsDeBaseKeys = Object.keys(articleDetails);
  const [nom, setNom] = useState('');
  const [style, setStyle] = useState('');
  const [taille, setTaille] = useState('');
  const [couleur, setCouleur] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [formError, setFormError] = useState('');
  const [customPrice, setCustomPrice] = useState(0);

  const couleursSuggerees = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Beige'];

  const isAutreMode = nom === 'autre';
  const isSacADos = nom === 'sac a dos';
  const isTailleRequired = nom !== 'autre' && nom !== 'sac a dos';
  const isCouleurRequired = !isAutreMode;
  const isTailleDisabled = isSacADos;

  const stylesDisponibles = useMemo(() => (nom && !isAutreMode ? articleDetails[nom]?.styles || [] : []), [nom, isAutreMode]);

  const prixAffiche = useMemo(() => {
    if (nom && !isAutreMode && style && articleDetails[nom]?.prix?.[style]) {
        const basePrice = articleDetails[nom].prix[style];
        // Correction: 'enfant' style for 'hoodie' should have a specific price if a valid size is chosen
        if (nom === 'hoodie' && style === 'enfant' && ['S', 'M', 'L', 'XL', 'XXL'].includes(taille.toUpperCase())) {
          return 1650; // This specific case might need adjustment based on actual pricing logic if 'enfant' hoodie has a standard price regardless of size for these sizes
        }
        return basePrice;
    }
    return null;
  }, [nom, style, taille, isAutreMode]);

  const handleNomChange = (selectedNom) => {
    setNom(selectedNom);
    setStyle('');
    setCustomPrice(0);
    if (selectedNom === 'sac a dos') {
        setTaille('Unique');
    } else {
        setTaille('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('');
    const nomFinal = isAutreMode ? style : nom;
    const styleFinal = isAutreMode ? null : (style || null);
    const quantiteParsed = parseInt(quantite);
    const tailleAEnvoyer = isSacADos ? 'Unique' : (taille || null);
    const couleurAEnvoyer = isCouleurRequired ? couleur : (couleur || null);

    let prixFinal;
    if (isAutreMode) {
      prixFinal = parseFloat(customPrice);
      if (isNaN(prixFinal)) prixFinal = 0;
    } else {
      prixFinal = prixAffiche;
    }

    let validationError = "";
    if (!nomFinal) validationError = isAutreMode ? '"Nom d\'article"' : '"Article"';
    else if (isTailleRequired && !tailleAEnvoyer) validationError = '"Taille"'; // Use tailleAEnvoyer for validation
    else if (isCouleurRequired && !couleurAEnvoyer) validationError = '"Couleur"'; // Use couleurAEnvoyer for validation
    else if (isNaN(quantiteParsed) || quantiteParsed < 0) validationError = '"Quantité (>= 0)"';

    if (validationError) {
      setFormError(`Veuillez remplir le champ ${validationError}.`);
      return;
    }

    if (!isAutreMode && stylesDisponibles.length > 0 && !styleFinal) {
        setFormError("Veuillez choisir un style pour cet article."); return;
    }

    if (!prixFinal && !isAutreMode) {
      setFormError("Le prix de l'article ne peut pas être déterminé. Veuillez vérifier l'article et le style.");
      return;
    }
    if (isAutreMode && (isNaN(prixFinal) || prixFinal === 0)) {
      setFormError("Veuillez entrer un prix valide pour le nouvel article.");
      return;
    }

    const newItem = { nom: nomFinal, taille: tailleAEnvoyer, couleur: couleurAEnvoyer, style: styleFinal, quantite: quantiteParsed, prix: prixFinal };

    try {
      console.log('Envoi au backend:', newItem);
      const response = await fetch('http://localhost:3001/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        alert('Article ajouté/quantité mise à jour !');
        setNom(''); setTaille(''); setCouleur(''); setStyle(''); setQuantite(1); setCustomPrice(0);
        if (typeof onStockAdded === 'function') { onStockAdded(); }
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
      <div className="form-control-stock"> <label>Article*:</label> <select value={nom} onChange={e => handleNomChange(e.target.value)} required> <option value="" disabled>-- Choisir --</option> {nomsDeBaseKeys.map(n => <option key={n} value={n}>{articleDetails[n].display}</option>)} </select> </div>
      <div className="form-control-stock"> <label>{isAutreMode ? "Nom d'article*:" : "Style:"}</label> {isAutreMode ? ( <input type="text" value={style} onChange={e => setStyle(e.target.value)} placeholder="Nom du nouvel article" required /> ) : ( <select value={style} onChange={e => setStyle(e.target.value)} required={stylesDisponibles.length > 0 && nom !== 'autre'} disabled={!nom || stylesDisponibles.length === 0}> <option value="">-- {nom ? (stylesDisponibles.length > 0 ? 'Choisir style' : 'Aucun') : 'Choisir article'} --</option> {stylesDisponibles.map(s => <option key={s} value={s}>{s}</option>)} </select> )} </div>
      <div className="form-control-stock"> <label>{isTailleRequired ? "Taille*:" : "Taille (Optionnel):"}</label> <input type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder={isSacADos ? "Unique" : "S, M, L..."} required={isTailleRequired} list="tailles" disabled={isTailleDisabled} /> <datalist id="tailles"> {taillesSuggereesFinales.map(t => <option key={t} value={t} />)} </datalist> </div>

      <div className="form-control-stock">
        <label>{isCouleurRequired ? "Couleur*:" : "Couleur (Optionnel):"}</label>
        <input
          type="text"
          value={couleur}
          onChange={e => setCouleur(e.target.value)}
          placeholder="Noir, Blanc..."
          required={isCouleurRequired}
          list="couleurs"
          disabled={!nom}
        />
        <datalist id="couleurs">
          {couleursSuggerees.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      <div className="form-control-stock quantity-input"> <label>Qté*:</label> <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} min="0" required disabled={!nom}/> </div>

      <div className="form-control-stock price-display">
        <label>Prix (Unitaire)*:</label>
        {isAutreMode ? (
          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="Prix (ex: -500 ou 1200)"
            step="any"
            disabled={!nom}
            required
          />
        ) : (
          <input
            type="text"
            value={prixAffiche !== null ? `${prixAffiche} DZD` : (nom ? 'Choisir style' : '-')}
            readOnly
            disabled
          />
        )}
      </div>

      <button type="submit" className="btn-submit-stock" disabled={!nom}>Ajouter</button>
    </form>
  );
}
// --- FIN Formulaire ---


// --- Composant Page Principale ---
function StockPage({ token }) {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleFilter, setArticleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  // L'état financialSummary a été SUPPRIMÉ

  const fetchStock = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/stock', {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        let errorMsg = `Erreur réseau ou serveur (${response.status})`;
        try {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) { errorMsg = "Session expirée. Veuillez vous reconnecter."; }
          else { errorMsg = errorData.error || errorMsg; }
        } catch(jsonError) { /* ignore */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setStockItems(Array.isArray(data) ? data : []);
    } catch (err) {
        setError("Impossible de charger le stock: " + err.message);
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
      setError("Veuillez vous connecter pour voir le stock.");
      setStockItems([]);
    }
  }, [token]);

  // Le useEffect pour le gain a été SUPPRIMÉ

  const handleQuantityChange = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0) return;
    try {
      const response = await fetch(`http://localhost:3001/api/stock/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantite: newQuantity }),
        });

        if (response.ok) {
          fetchStock();
        } else {
          const errData = await response.json();
          alert(`Erreur MàJ quantité: ${errData.error || 'Erreur serveur.'}`);
        }
    } catch (err) { alert('Erreur MàJ quantité (réseau).'); console.error(err); }
  };

  const handleDeleteGroup = async (groupInfo) => {
    let cardTitle = groupInfo.displayNom;
    if (groupInfo.displayStyle) {
        cardTitle += ` - ${groupInfo.displayStyle}`;
    }
    if (groupInfo.displayCouleur) {
        cardTitle += ` - ${groupInfo.displayCouleur}`;
    }

    const nomKey = Object.keys(articleDetails).find(k => articleDetails[k].display === groupInfo.displayNom) || groupInfo.displayNom;
    const styleKey = groupInfo.styleKey;

    if (!window.confirm(`Es-tu sûr de vouloir supprimer TOUS les articles "${cardTitle}" ?\nAction irréversible !`)) return;

    const couleurParam = groupInfo.displayCouleur ? groupInfo.displayCouleur : 'null';
    let url = `http://localhost:3001/api/stock/group?nom=${encodeURIComponent(nomKey)}&couleur=${encodeURIComponent(couleurParam)}`;

    if (styleKey !== undefined && styleKey !== null) {
        url += `&style=${encodeURIComponent(styleKey)}`;
    }

    console.log('DELETE Group URL:', url);

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const result = await response.json();

          if (response.ok) {
            alert(result.message || `Groupe "${cardTitle}" supprimé.`);
            fetchStock();
          } else {
            alert(`Erreur suppression groupe: ${result.error || 'Erreur inconnue.'}`);
            console.error('Erreur DELETE Group:', result);
          }
    } catch (err) {
        alert('Erreur réseau suppression groupe.');
        console.error('Erreur fetch DELETE Group:', err);
    }
  };


  // --- LOGIQUE POUR LES CARTES ET LE RÉSUMÉ GLOBAL ---
  const { stockSummaryByVariation, totalItemsByCategory, totalGlobalQuantity, totalGlobalValue, valueByArticle } = useMemo(() => {
    let summary = {};
    let totalsByCategory = {};
    let valueByArticle = {};
    let globalTotalQuantity = 0;
    let globalTotalValue = 0;

    if (Array.isArray(stockItems)) {
        stockItems.forEach(item => {
          const itemQuantity = Number(item.quantite) || 0;
          if (isNaN(itemQuantity)) {
              console.warn(`Item ID ${item.id} a une quantité invalide:`, item.quantite);
              return;
          }
          const baseKey = Object.keys(articleDetails).find(key => key === item.nom) || 'autre';
          const couleur = item.couleur || null;
          const styleKey = item.style;

          let groupKey = '';
          let displayNom = '';
          let displayStyle = '';
          let displayCouleur = couleur;

          if (baseKey === 'autre') {
              const customNom = item.nom;
              groupKey = `autre-${customNom}-${couleur}`;
              displayNom = customNom;
              displayStyle = '';
          } else {
              displayStyle = styleKey || 'standard';
              groupKey = `${item.nom}-${displayStyle}-${couleur}`;
              displayNom = articleDetails[baseKey]?.display || item.nom;
          }

          if (!summary[groupKey]) {
              summary[groupKey] = {
                  displayNom,
                  displayStyle,
                  displayCouleur,
                  styleKey,
                  totalQuantity: 0,
                  quantitiesByTaille: {}
              };
          }

          const unitPrice = Number(item.prix) || 0;
          const variationValue = unitPrice * itemQuantity;

          summary[groupKey].totalQuantity += itemQuantity;
          globalTotalQuantity += itemQuantity;
          globalTotalValue += variationValue;

          const articleDisplayName = articleDetails[baseKey]?.display || 'Autre';

          totalsByCategory[articleDisplayName] = (totalsByCategory[articleDisplayName] || 0) + itemQuantity;
          valueByArticle[articleDisplayName] = (valueByArticle[articleDisplayName] || 0) + variationValue;

          const taille = item.taille || 'Unique';

          if (!summary[groupKey].quantitiesByTaille[taille]) {
              summary[groupKey].quantitiesByTaille[taille] = { id: item.id, quantite: itemQuantity };
          } else {
              summary[groupKey].quantitiesByTaille[taille].quantite += itemQuantity;
          }

        });
    } else {
        console.error("stockItems n'est pas un array:", stockItems);
    }

    return {
        stockSummaryByVariation: summary,
        totalItemsByCategory: totalsByCategory,
        totalGlobalQuantity: globalTotalQuantity,
        totalGlobalValue: globalTotalValue,
        valueByArticle: valueByArticle
    };
  }, [stockItems]);
  // --- FIN LOGIQUE CARTES ---

  // --- Fonctions de Tri et Filtrage ---
  const articleOrder = ['t shirt', 'hoodie', 'jogging', 'sac a dos', 'autre'];

  const getSortedKeysForArticle = (articleBaseKey) => {
    return Object.keys(stockSummaryByVariation)
        .filter(key => {
          const baseItemKey = key.split('-')[0];
          const isInDetails = Object.keys(articleDetails).includes(baseItemKey);
          if (articleBaseKey === 'autre') return !isInDetails || key.startsWith('autre-');
          return key.startsWith(`${articleBaseKey}-`);
        })
        .filter(key => stockSummaryByVariation[key]?.totalQuantity > 0)
        .sort((keyA, keyB) => {
          const summaryA = stockSummaryByVariation[keyA];
          const summaryB = stockSummaryByVariation[keyB];
          const styleCompare = (summaryA?.displayStyle || '').localeCompare(summaryB?.displayStyle || '');
          if (styleCompare !== 0) return styleCompare;
          return (summaryA?.displayCouleur || '').localeCompare(summaryB?.displayCouleur || '');
        });
  };

  const filteredDisplayKeys = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return Object.keys(stockSummaryByVariation)
        .filter(key => stockSummaryByVariation[key]?.totalQuantity > 0)
        .filter(key => {
          const baseItemKey = key.split('-')[0];
          const isInDetails = Object.keys(articleDetails).includes(baseItemKey);
          if (articleFilter === 'all') return true;
          if (articleFilter === 'autre') return !isInDetails || key.startsWith('autre-');
          return key.startsWith(`${articleFilter}-`);
        })
        .filter(key => {
          if (term === '') return true;
          const summary = stockSummaryByVariation[key];
          if (!summary) return false;
          let cardTitle = summary.displayNom;
          if (summary.displayStyle && !key.startsWith('autre-')) {
              cardTitle += ` ${summary.displayStyle}`;
          }
          if (summary.displayCouleur) {
              cardTitle += ` ${summary.displayCouleur}`;
          }
          if (cardTitle.toLowerCase().includes(term)) return true;
          const hasMatchingTaille = Object.keys(summary.quantitiesByTaille)
              .some( taille => taille.toLowerCase().includes(term) );
          if (hasMatchingTaille) return true;
          return false;
        })
        .sort((keyA, keyB) => {
          const summaryA = stockSummaryByVariation[keyA];
          const summaryB = stockSummaryByVariation[keyB];
          const baseKeyA = keyA.split('-')[0];
          const baseKeyB = keyB.split('-')[0];
          const indexA = articleOrder.indexOf(baseKeyA === 'autre' ? 'autre' : baseKeyA);
          const indexB = articleOrder.indexOf(baseKeyB === 'autre' ? 'autre' : baseKeyB);
          const effectiveIndexA = indexA === -1 ? articleOrder.indexOf('autre') : indexA;
          const effectiveIndexB = indexB === -1 ? articleOrder.indexOf('autre') : indexB;
          if (effectiveIndexA !== effectiveIndexB) { return effectiveIndexA - effectiveIndexB; }
          if (baseKeyA === 'autre' && baseKeyB === 'autre') {
            const nameCompare = (summaryA?.displayNom || '').localeCompare(summaryB?.displayNom || '');
            if (nameCompare !== 0) return nameCompare;
          }
          const styleCompare = (summaryA?.displayStyle || '').localeCompare(summaryB?.displayStyle || '');
          if (styleCompare !== 0) return styleCompare;
          return (summaryA?.displayCouleur || '').localeCompare(summaryB?.displayCouleur || '');
        });
  }, [stockSummaryByVariation, articleFilter, searchTerm]);
  // --- FIN LOGIQUE FILTRAGE ---


  // --- Formatage Argent (inchangé) ---
  const formatArgent = (nombre) => {
    if (typeof nombre !== 'number' || isNaN(nombre)) {
        return '0 DZD';
    }
    return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';
  };
  // --- FIN Formatage ---


  // --- RENDER ---
  return (
    <div className="stock-page-content">
      <h2>Gestion du Stock</h2>
      <AddStockItemForm onStockAdded={fetchStock} token={token} />

      <hr className="stock-divider"/>

      <div className="stock-filters">
        <input type="text" placeholder="Rechercher par nom, style, couleur, taille..." className="filter-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="filter-article-select" value={articleFilter} onChange={(e) => setArticleFilter(e.target.value)}>
          <option value="all">Tous les articles</option>
          {articleOrder.map(key => ( <option key={key} value={key}>{articleDetails[key]?.display || key}</option> ))}
        </select>
      </div>

      <h3>Récapitulatif Détaillé du Stock</h3>

      {loading ? (
        <p>Chargement du stock...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="stock-content-wrapper">
          {filteredDisplayKeys.length > 0 ? (
              <div className="stock-sections-container">
                {articleOrder.map(articleKey => {
                    const variationKeys = getSortedKeysForArticle(articleKey);
                    const displayedKeysInSection = variationKeys.filter(key => filteredDisplayKeys.includes(key));
                    if (displayedKeysInSection.length === 0) return null;
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
                              if (!variationSummary) return null;
                              let cardTitle = variationSummary.displayNom;
                              if (variationSummary.displayStyle && variationSummary.displayStyle !== 'standard' && !key.startsWith('autre-')) {
                                  cardTitle += ` - ${variationSummary.displayStyle}`;
                              }
                              if (variationSummary.displayCouleur) {
                                  cardTitle += ` - ${variationSummary.displayCouleur}`;
                              }
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
                                            // Handle cases where taille is not in order (e.g., custom sizes for 'autre')
                                            const indexA = order.indexOf(tailleA);
                                            const indexB = order.indexOf(tailleB);
                                            if (indexA === -1 && indexB === -1) return tailleA.localeCompare(tailleB); // Both custom, sort alphabetically
                                            if (indexA === -1) return 1; // A is custom, B is standard, B comes first
                                            if (indexB === -1) return -1; // B is custom, A is standard, A comes first
                                            return indexA - indexB; // Both standard, sort by predefined order
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
                                        {variationSummary.totalQuantity > 0 && Object.values(variationSummary.quantitiesByTaille).every(data => data.quantite <= 0) && <li className="no-stock-message">Stock épuisé</li> }
                                  </ul>
                                </div>
                              );
                            })}
                        </div>
                      </section>
                    );
                  })}
              </div>
            ) : (
              <p className="empty-summary-message">
                {stockItems.length > 0 ? "Aucun article ne correspond à votre recherche ou filtre." : (error ? error : "Votre stock est vide.")}
              </p>
            )}
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

              {/* Le Gain Potentiel a été SUPPRIMÉ d'ici */}

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
                {Object.keys(totalItemsByCategory).length === 0 && <p className='empty-summary-message'>Aucun article en stock.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default StockPage;