import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './StockPage.css';

// --- Structure des données articleDetails ---
const articleDetails = {
  't shirt': { display: 'T-shirt', styles: ['oversize', 'oversize premium', 'regular premium', 'regular', 'enfant'], prix: { 'oversize': 950, 'oversize premium': 1150,'regular': 790, 'enfant': 620 } },
  'hoodie': { display: 'Hoodie', styles: ['orma premium', 'enfant', 'standard'], prix: { 'orma premium': 1650, 'enfant': 1300, 'standard': 1260 } },
  'jogging': { display: 'Jogging', styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 } },
  'sac a dos': { display: 'Sac à dos', styles: ['standard', 'premium'], prix: { 'standard': 1150, 'premium': 1220 } },
  'autre': { display: 'Autre', styles: [], prix: {} }
};
const articleOrder = ['t shirt', 'hoodie', 'jogging', 'sac a dos', 'autre'];

// --- Fonction utilitaire pour la couleur ---
function getColorSwatch(couleur) {
  if (!couleur) return null;
  const lowerCaseCouleur = couleur.toLowerCase().trim();
  let colorCode = 'transparent';

  switch (lowerCaseCouleur) {
    case 'noir': colorCode = '#000000'; break;
    case 'blanc': colorCode = '#ffffff'; break;
    case 'gris': colorCode = '#808080'; break;
    case 'bleu': colorCode = '#4a90e2'; break;
    case 'rouge': colorCode = '#ff0000'; break;
    case 'vert': colorCode = '#008000'; break;
    case 'beige': colorCode = '#f5f5dc'; break;
    default:
      if (lowerCaseCouleur.match(/^#([0-9a-f]{3}){1,2}$/i)) {
        colorCode = lowerCaseCouleur;
      } else if (lowerCaseCouleur.match(/^[a-z]+$/i)) {
        colorCode = lowerCaseCouleur;
      } else {
        return null;
      }
  }
  return <span className="color-dot" style={{ backgroundColor: colorCode }}></span>;
}

// --- Composant Formulaire AddStockItemForm ---
function AddStockItemForm({ onStockAdded }) {
  const nomsDeBaseKeys = Object.keys(articleDetails);
  const [nom, setNom] = useState('');
  const [style, setStyle] = useState('');
  const [taille, setTaille] = useState('');
  const [couleur, setCouleur] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [formError, setFormError] = useState('');
  const [prixAchat, setPrixAchat] = useState(''); 

  const couleursSuggerees = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Beige'];
  const isAutreMode = nom === 'autre';
  const isSacADos = nom === 'sac a dos';
  const isTailleRequired = nom !== 'autre' && nom !== 'sac a dos';
  const isCouleurRequired = nom !== 'autre'; 
  const isTailleDisabled = isSacADos;

  const stylesDisponibles = useMemo(() => (nom && !isAutreMode ? articleDetails[nom]?.styles || [] : []), [nom, isAutreMode]);

  const prixAffiche = useMemo(() => {
    if (nom && !isAutreMode && style && articleDetails[nom]?.prix?.[style]) {
      const basePrice = articleDetails[nom].prix[style];
      if (nom === 'hoodie' && style === 'enfant' && ['S', 'M', 'L', 'XL', 'XXL'].includes(taille.toUpperCase())) {
        return 1650;
      }
      return basePrice;
    }
    return null;
  }, [nom, style, taille, isAutreMode]);

  const handleNomChange = (selectedNom) => {
    setNom(selectedNom);
    setStyle('');
    setPrixAchat('');
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
    const styleFinal = style || null; 
    const quantiteParsed = parseInt(quantite);
    const tailleAEnvoyer = isSacADos ? 'Unique' : (taille || null);
    const couleurAEnvoyer = couleur || null; 
    
    let unitPriceToUse = prixAffiche; 
    if (isAutreMode) {
      const parsedAchat = parseFloat(prixAchat);
      if (isNaN(parsedAchat) || parsedAchat <= 0) {
        setFormError("Veuillez saisir un prix valide (achat) pour cet article 'Autre'.");
        return;
      }
      unitPriceToUse = parsedAchat;
    }

    if (!nomFinal || isNaN(quantiteParsed) || quantiteParsed < 0) {
      setFormError('Veuillez remplir l\'article, la catégorie et la quantité.');
      return;
    }
    if (isTailleRequired && !taille) {
        setFormError('Veuillez choisir une "Taille" pour cet article.');
        return;
    }
    if (!isAutreMode && !couleurAEnvoyer) { 
      setFormError("Veuillez choisir une 'Couleur' pour cet article.");
      return;
    }
    if (!isAutreMode && stylesDisponibles.length > 0 && !styleFinal) {
      setFormError("Veuillez choisir un style pour cet article.");
      return;
    }

    const newItem = { 
        nom: nomFinal, 
        taille: tailleAEnvoyer, 
        couleur: couleurAEnvoyer, 
        style: styleFinal, 
        quantite: quantiteParsed,
        prix: unitPriceToUse 
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        // Petit alert retiré pour plus de fluidité, ou laisse-le si tu préfères
        // alert('Article ajouté !'); 
        setNom(''); setTaille(''); setCouleur(''); setStyle(''); setQuantite(1); setPrixAchat('');
        if (typeof onStockAdded === 'function') onStockAdded();
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || `Erreur ${response.status}.`);
      }
    } catch (err) {
      setFormError('Erreur réseau.');
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
      
      <div className="form-control-stock"> 
          <label>{isAutreMode ? "Nom/Style (Opt):" : "Style:"}</label> 
          {isAutreMode ? ( 
              <input type="text" value={style} onChange={e => setStyle(e.target.value)} placeholder="Ex: Casquette, T-shirt Logo" /> 
          ) : ( 
              <select value={style} onChange={e => setStyle(e.target.value)} required={!isAutreMode && stylesDisponibles.length > 0} disabled={!nom || stylesDisponibles.length === 0}> 
                  <option value="">-- {nom ? (stylesDisponibles.length > 0 ? 'Choisir style' : 'Aucun') : 'Choisir article'} --</option> 
                  {stylesDisponibles.map(s => <option key={s} value={s}>{s}</option>)} 
              </select> 
          )} 
      </div>
      
      <div className="form-control-stock"> 
          <label>{isTailleRequired ? "Taille*:" : "Taille (Opt):"}</label> 
          <input type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder={isSacADos ? "Unique" : "S, M, L..."} required={isTailleRequired} list="tailles" disabled={isTailleDisabled} /> 
          <datalist id="tailles"> {taillesSuggereesFinales.map(t => <option key={t} value={t} />)} </datalist> 
      </div>

      <div className="form-control-stock">
        <label>{isCouleurRequired ? "Couleur*:" : "Couleur (Opt):"}</label>
        <input type="text" value={couleur} onChange={e => setCouleur(e.target.value)} placeholder="Noir, Blanc..." required={isCouleurRequired} list="couleurs" disabled={!nom}/>
        <datalist id="couleurs"> {couleursSuggerees.map(c => <option key={c} value={c} />)} </datalist>
      </div>

      <div className="form-control-stock quantity-input"> <label>Qté*:</label> <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} min="0" required disabled={!nom}/> </div>

      <div className="form-control-stock price-display">
        <label>{isAutreMode ? "Prix Achat (DZD)*:" : "Prix Vente (DZD):"}</label>
        {isAutreMode ? (
            <input type="number" value={prixAchat} onChange={e => setPrixAchat(e.target.value)} min="0" required={isAutreMode} />
        ) : (
            <input type="text" value={prixAffiche !== null ? `${prixAffiche} DZD` : '-'} readOnly disabled />
        )}
      </div>
      <button type="submit" className="btn-submit-stock" disabled={!nom || (isAutreMode && !prixAchat)}>Ajouter</button>
    </form>
  );
}

// --- Composant Section d'Article par Style (ArticleSection) ---
function ArticleSection({ articleKey, stockSummaryByVariation, allFilteredDisplayKeys, getSortedKeysForArticle, handleQuantityChange, handleDeleteGroup }) {
    const displayedKeysInSection = getSortedKeysForArticle(articleKey).filter(key => allFilteredDisplayKeys.includes(key));
    if (displayedKeysInSection.length === 0) return null;
    const totalArticleQuantity = displayedKeysInSection.reduce((sum, key) => sum + (stockSummaryByVariation[key]?.totalQuantity || 0), 0);

    const { sortedStylesKeys, stylesGroups, orderedStyles } = useMemo(() => {
        const stylesGroups = displayedKeysInSection.reduce((acc, key) => {
            const summary = stockSummaryByVariation[key];
            if (!summary) return acc;
            const style = summary.displayStyle || (articleKey !== 'autre' ? 'standard' : 'Autres Variations');
            if (!acc[style]) { acc[style] = []; }
            acc[style].push(key);
            return acc;
        }, {});

        const orderedStyles = articleDetails[articleKey]?.styles || [];
        const allStylesKeys = Object.keys(stylesGroups);
        const sortedStylesKeys = [
            ...orderedStyles.filter(style => allStylesKeys.includes(style)),
            ...allStylesKeys.filter(style => !orderedStyles.includes(style) && style !== 'standard' && style !== 'Autres Variations'),
            ...allStylesKeys.filter(style => style === 'standard'),
            stylesGroups['Autres Variations'] ? 'Autres Variations' : null
        ].filter((value, index, self) => value && self.indexOf(value) === index);

        return { sortedStylesKeys, stylesGroups, orderedStyles };
    }, [displayedKeysInSection, stockSummaryByVariation, articleKey]);

    return (
        <section key={articleKey} className="article-section">
            <h4 className="article-section-title">
                {articleDetails[articleKey]?.display || 'Autres Articles'}
                <span>({totalArticleQuantity} pcs)</span>
            </h4>

            <div className="article-styles-container">
                {sortedStylesKeys.map(styleKey => (
                    <div key={styleKey} className="style-group">
                        {((orderedStyles.length > 1) || articleKey === 'autre' || styleKey !== 'standard') && (
                            <h5 className="style-group-title">
                                {styleKey === 'Autres Variations' ? 'Articles Divers' : styleKey}
                            </h5>
                        )}

                        <div className="stock-summary-grid">
                            {stylesGroups[styleKey]
                                .sort((keyA, keyB) => {
                                    const summaryA = stockSummaryByVariation[keyA];
                                    const summaryB = stockSummaryByVariation[keyB];
                                    const couleurA = (summaryA?.displayCouleur || '').toLowerCase();
                                    const couleurB = (summaryB?.displayCouleur || '').toLowerCase();
                                    const getOrder = (couleur) => {
                                        if (couleur === 'noir') return 0;
                                        if (couleur === 'blanc') return 1;
                                        return 2;
                                    };
                                    const orderA = getOrder(couleurA);
                                    const orderB = getOrder(couleurB);
                                    if (orderA !== orderB) return orderA - orderB;
                                    return couleurA.localeCompare(couleurB);
                                })
                                .map(key => {
                                    const variationSummary = stockSummaryByVariation[key];
                                    if (!variationSummary) return null;

                                    let titleContent = variationSummary.displayNom;
                                    if(articleKey === 'autre' && variationSummary.displayStyle) {
                                        titleContent = variationSummary.displayStyle;
                                    } else if (styleKey === 'standard' && orderedStyles.length > 1) {
                                        titleContent += ` - ${styleKey}`;
                                    } else if (styleKey !== 'standard' && articleKey !== 'autre') {
                                        if (!((orderedStyles.length > 1) || articleKey === 'autre' || styleKey !== 'standard')) {
                                               titleContent += ` - ${styleKey}`;
                                        }
                                    }
                                    titleContent += ` - ${variationSummary.displayCouleur}`;

                                    return (
                                        <div key={key} className="article-summary-card">
                                            <h5>
                                                {titleContent}
                                                <span>({variationSummary.totalQuantity} pcs)</span>
                                                <button onClick={() => handleDeleteGroup(variationSummary)} className="btn-delete-group" title="Supprimer tout ce groupe">🗑️</button>
                                            </h5>
                                            <ul className="variation-list size-only-list">
                                                {Object.entries(variationSummary.quantitiesByTaille)
                                                    .filter(([, data]) => data.quantiteTotal > 0)
                                                    .sort(([tailleA], [tailleB]) => {
                                                        const order = ['6 ans', '8 ans', '10 ans', '12 ans', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique', '-'];
                                                        return order.indexOf(tailleA) - order.indexOf(tailleB);
                                                    })
                                                    .map(([taille, data]) => (
                                                        <li key={taille}>
                                                            <span className="variation-details">{taille}</span>
                                                            <span className="variation-quantity-controls">
                                                                {/* ICI LA MODIFICATION : On passe 'data.rows' (le tableau) au lieu de data.id */}
                                                                <button onClick={() => handleQuantityChange(data.rows, -1)} disabled={data.quantiteTotal <= 0}>-</button>
                                                                <span className="variation-quantity">{data.quantiteTotal}</span>
                                                                <button onClick={() => handleQuantityChange(data.rows, 1)}>+</button>
                                                            </span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}


// --- Composant Page Principale (StockPage) ---
function StockPage() {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleFilter, setArticleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStock = useCallback(async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stock`, {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        let errorMsg = `Erreur réseau ou serveur (${response.status})`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (jsonError) { /* ignore */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setStockItems(Array.isArray(data) ? data : []);
    }
    catch (err) {
      setError("Impossible de charger le stock: " + err.message);
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchStock();
  }, [fetchStock]);

  // --- MODIFICATION MAJEURE : GESTION INTELLIGENTE DE L'ID ---
  const handleQuantityChange = async (rows, change) => {
    // rows est maintenant un TABLEAU d'objets {id, quantite}
    // change est +1 ou -1

    let targetRow = null;

    if (change < 0) {
        // Si on veut diminuer : on cherche une ligne qui a VRAIMENT du stock (> 0)
        // Cela résout le bug où on essayait de diminuer une ligne à 0 alors qu'une autre ligne avait du stock
        targetRow = rows.find(row => row.quantite > 0);
    } else {
        // Si on veut augmenter : on prend la première ligne disponible (ou n'importe laquelle valide)
        targetRow = rows[0];
    }

    // Si aucune ligne trouvée (ex: bug visuel, on essaie de diminuer un total à 0), on arrête
    if (!targetRow) {
        console.warn("Impossible de modifier le stock : aucune ligne éligible trouvée.");
        return;
    }

    const newQuantity = targetRow.quantite + change;
    
    // Sécurité supplémentaire
    if (newQuantity < 0) return;

    try {
      const token = localStorage.getItem('token');
      // On utilise targetRow.id, c'est le bon ID garanti !
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/${targetRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantite: newQuantity }),
      });
      if (response.ok) {
        fetchStock();
      } else {
        // alert retiré pour fluidité, sauf erreur critique
        console.error('Erreur lors de la mise à jour de la quantité (serveur).');
      }
    } catch (err) { console.error('Erreur réseau lors de la mise à jour de la quantité.'); }
  };

  const handleDeleteGroup = async (groupInfo) => {
    let cardTitle = groupInfo.displayNom;
    if (groupInfo.displayStyle && groupInfo.displayStyle !== 'standard' && !groupInfo.displayNom.startsWith('autre-')) { cardTitle += ` - ${groupInfo.displayStyle}`; }
    cardTitle += ` - ${groupInfo.displayCouleur}`;

    const nomKey = Object.keys(articleDetails).find(k => articleDetails[k].display === groupInfo.displayNom) || groupInfo.displayNom;
    const styleKey = (groupInfo.displayStyle === 'standard' || groupInfo.displayStyle === '') ? '' : groupInfo.displayStyle;

    if (!window.confirm(`Es-tu sûr de vouloir supprimer TOUS les articles "${cardTitle}" ?\nCette action est irréversible !`)) { return; }

    const url = `${import.meta.env.VITE_API_URL}/api/stock/group?nom=${encodeURIComponent(nomKey)}&couleur=${encodeURIComponent(groupInfo.displayCouleur)}${styleKey ? `&style=${encodeURIComponent(styleKey)}` : ''}`;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok || response.status === 404) {
        alert(`Groupe "${cardTitle}" supprimé avec succès.`);
        fetchStock();
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la suppression du groupe: ${errorData.error || response.status}`);
      }
    } catch (err) { alert('Erreur réseau lors de la suppression du groupe.'); }
  };

  // --- Logique de regroupement (useMemo) ---
  const { stockSummaryByVariation, totalItemsByCategory, totalGlobalQuantity, totalGlobalValue, valueByArticle } = useMemo(() => {
    let summary = {};
    let totalsByCategory = {};
    let valueByArticle = {};
    let globalTotalQuantity = 0;
    let globalTotalValue = 0;

    if (Array.isArray(stockItems)) {
      stockItems.forEach(item => {
        const itemQuantity = Number(item.quantite) || 0;
        // Note: On accepte les quantité 0 pour qu'elles soient prises en compte si on veut ajouter du stock plus tard
        if (isNaN(itemQuantity) || itemQuantity < 0) { return; }

        const baseKey = Object.keys(articleDetails).find(key => key === item.nom) || 'autre';
        const couleur = item.couleur || 'Inconnue';

        let groupKey = '';
        let displayNom = '';
        let displayStyle = item.style || 'standard';
        let displayCouleur = couleur;

        if (baseKey === 'autre') {
          const customNom = item.style || item.nom || `Inconnu ID ${item.id}`;
          groupKey = `autre-${customNom}-${couleur}`;
          displayNom = customNom;
          displayStyle = '';
        } else {
          groupKey = `${item.nom}-${displayStyle}-${couleur}`;
          displayNom = articleDetails[baseKey]?.display || item.nom;
        }

        if (!summary[groupKey]) { summary[groupKey] = { displayNom, displayStyle, displayCouleur, totalQuantity: 0, quantitiesByTaille: {} }; }

        let unitPrice = 0;
        if (item.prix && typeof item.prix === 'number') {
            unitPrice = item.prix;
        } 
        
        if (baseKey !== 'autre') {
            const styleToLook = item.style || 'standard';
            const articleData = articleDetails[baseKey];
            if (articleData && articleData.prix && typeof articleData.prix[styleToLook] === 'number') { unitPrice = articleData.prix[styleToLook]; }
            else if (articleData && articleData.prix && styleToLook === 'standard' && typeof articleData.prix['standard'] === 'number') { unitPrice = articleData.prix['standard']; }
            if (baseKey === 'hoodie' && item.style === 'enfant' && ['S', 'M', 'L', 'XL', 'XXL'].includes((item.taille || '').toUpperCase())) { unitPrice = 1650; }
        }
        const variationValue = unitPrice * itemQuantity;

        summary[groupKey].totalQuantity += itemQuantity;
        globalTotalQuantity += itemQuantity;
        globalTotalValue += variationValue;

        const articleDisplayName = articleDetails[baseKey]?.display || displayNom;
        totalsByCategory[articleDisplayName] = (totalsByCategory[articleDisplayName] || 0) + itemQuantity;
        valueByArticle[articleDisplayName] = (valueByArticle[articleDisplayName] || 0) + variationValue;

        const taille = item.taille || 'Unique';
        
        // --- MODIFICATION CRITIQUE ICI ---
        // Au lieu d'écraser l'ID, on accumule les lignes dans un tableau 'rows'
        if (!summary[groupKey].quantitiesByTaille[taille]) { 
            summary[groupKey].quantitiesByTaille[taille] = { 
                quantiteTotal: 0,
                rows: [] // On initialise un tableau vide
            }; 
        }
        
        summary[groupKey].quantitiesByTaille[taille].quantiteTotal += itemQuantity;
        // On ajoute cette ligne spécifique (ID et sa quantité propre) au tableau
        summary[groupKey].quantitiesByTaille[taille].rows.push({
            id: item.id,
            quantite: itemQuantity
        });

      });
    }

    return { 
        stockSummaryByVariation: summary, 
        totalItemsByCategory: totalsByCategory, 
        totalGlobalQuantity: globalTotalQuantity, 
        totalGlobalValue: globalTotalValue, 
        valueByArticle: valueByArticle 
    };
  }, [stockItems]);

  // --- Logique de Filtrage ---
  const getSortedKeysForArticle = useCallback((articleBaseKey) => {
    return Object.keys(stockSummaryByVariation)
      .filter(key => {
        if (articleBaseKey === 'autre') { return key.startsWith('autre-'); }
        const baseItemKey = key.split('-')[0];
        const isInDetails = Object.keys(articleDetails).includes(baseItemKey);
        if (articleBaseKey === 'autre') return !isInDetails || key.startsWith('autre-');
        return key.startsWith(`${articleBaseKey}-`) && isInDetails;
      })
      .filter(key => stockSummaryByVariation[key]?.totalQuantity > 0)
      .sort((keyA, keyB) => {
        const summaryA = stockSummaryByVariation[keyA];
        const summaryB = stockSummaryByVariation[keyB];
        const styleCompare = (summaryA?.displayStyle || '').localeCompare(summaryB?.displayStyle || '');
        if (styleCompare !== 0) return styleCompare;
        return (summaryA?.displayCouleur || '').localeCompare(summaryB?.displayCouleur || '');
      });
  }, [stockSummaryByVariation]);

  const allFilteredDisplayKeys = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return Object.keys(stockSummaryByVariation)
      .filter(key => stockSummaryByVariation[key]?.totalQuantity > 0)
      .filter(key => {
        const baseItemKey = key.split('-')[0];
        const isInDetails = Object.keys(articleDetails).includes(baseItemKey);
        if (articleFilter === 'all') return true;
        if (articleFilter === 'autre') return !isInDetails || key.startsWith('autre-');
        return key.startsWith(`${articleFilter}-`) && isInDetails;
      })
      .filter(key => {
        if (term === '') return true;
        const summary = stockSummaryByVariation[key];
        if (!summary) return false;
        let cardTitle = summary.displayNom;
        if (summary.displayStyle && summary.displayStyle !== 'standard' && !key.startsWith('autre-')) { cardTitle += ` ${summary.displayStyle}`; }
        cardTitle += ` ${summary.displayCouleur}`;

        if (cardTitle.toLowerCase().includes(term)) return true;
        const hasMatchingTaille = Object.keys(summary.quantitiesByTaille).some(taille => taille.toLowerCase().includes(term));
        if (hasMatchingTaille) return true;

        return false;
      });
  }, [stockSummaryByVariation, articleFilter, searchTerm]);

  const formatArgent = (nombre) => {
    if (typeof nombre !== 'number' || isNaN(nombre)) { return '0 DZD'; }
    return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';
  };

  return (
    <>
      <div className="stock-page-content">
        <div className="stock-page-header">
          <h2>Gestion du Stock</h2>
          <div className="header-actions"></div>
        </div>

        <AddStockItemForm onStockAdded={fetchStock} />

        <hr className="stock-divider" />

        <div className="stock-filters">
          <input
            type="text"
            placeholder="Rechercher par nom, style, couleur, taille..."
            className="filter-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-article-select"
            value={articleFilter}
            onChange={(e) => setArticleFilter(e.target.value)}
          >
            <option value="all">Tous les articles</option>
            {articleOrder.map(key => (
              <option key={key} value={key}> {articleDetails[key]?.display || key} </option>
            ))}
          </select>
        </div>

        <h3>Récapitulatif Détaillé du Stock</h3>

        {loading ? (
          <p>Chargement du stock...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="stock-content-wrapper">
            {allFilteredDisplayKeys.length > 0 ? (
              <div className="stock-sections-container">
                {articleOrder.map(articleKey => (
                    <ArticleSection
                        key={articleKey}
                        articleKey={articleKey}
                        stockSummaryByVariation={stockSummaryByVariation}
                        allFilteredDisplayKeys={allFilteredDisplayKeys}
                        getSortedKeysForArticle={getSortedKeysForArticle}
                        handleQuantityChange={handleQuantityChange}
                        handleDeleteGroup={handleDeleteGroup}
                    />
                ))}
              </div>
            ) : (
              <p className="empty-summary-message"> {stockItems.length > 0 ? "Aucun article ne correspond à votre recherche ou filtre." : "Votre stock est vide."} </p>
            )}
          </div>
        )}

        <div className={`stock-floating-summary ${isSummaryOpen ? 'open' : 'closed'}`}>
          <button className="summary-toggle-btn" onClick={() => setIsSummaryOpen(!isSummaryOpen)}>
          {isSummaryOpen ? '▼ Fermer' : '▲ Totaux'}
          </button>

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

            <hr className="summary-divider" />
            <h5 className="category-summary-title">Détails</h5>
            <div className="category-totals">
              <div className="category-header summary-line">
                <span>Article</span>
                <span className="summary-value" style={{ textAlign: 'right' }}>Quantité</span>
                <span className="category-value" style={{ textAlign: 'right' }}>Valeur</span>
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
      </div>
    </>
  );
}

export default StockPage;