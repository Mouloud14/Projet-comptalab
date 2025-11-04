import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './StockPage.css';

// --- Structure des données articleDetails ---
const articleDetails = {
  't shirt': { display: 'T-shirt', styles: ['oversize', 'oversize premium', 'regular premium', 'regular', 'enfant'], prix: { 'oversize': 1600, 'oversize premium': 1150, 'regular premium': 790, 'regular': 620, 'enfant': 620 } },
  'hoodie': { display: 'Hoodie', styles: ['orma premium', 'enfant', 'standard'], prix: { 'orma premium': 1650, 'enfant': 1300, 'standard': 1260 } },
  'jogging': { display: 'Jogging', styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 } },
  'sac a dos': { display: 'Sac à dos', styles: ['standard', 'premium'], prix: { 'standard': 1150, 'premium': 1220 } },
  'autre': { display: 'Autre', styles: [], prix: {} }
};
const articleOrder = ['t shirt', 'hoodie', 'jogging', 'sac a dos', 'autre'];

// --- Fonction utilitaire pour la couleur (Affichage des échantillons) ---
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
  const [quantite, setQuantite] = useState(0);
  const [formError, setFormError] = useState('');

  const couleursSuggerees = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Beige'];

  const isAutreMode = nom === 'autre';
  const isSacADos = nom === 'sac a dos';
  const isTailleRequired = nom !== 'autre' && nom !== 'sac a dos';
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
    if (selectedNom === 'sac a dos') {
      setTaille('Unique');
    } else {
      setTaille('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nomFinal = isAutreMode ? style : nom;
    const styleFinal = isAutreMode ? null : style;
    const quantiteParsed = parseInt(quantite);
    const tailleAEnvoyer = isSacADos ? 'Unique' : (taille || null);

    if (!nomFinal || (isTailleRequired && !taille) || !couleur || isNaN(quantiteParsed) || quantiteParsed < 0) {
      setFormError(`Veuillez remplir ${isAutreMode ? '"Nom d\'article"' : '"Article"'} ${isTailleRequired ? ', "Taille"' : ''} et "Couleur" avec une quantité >= 0.`);
      return;
    }
    if (!isAutreMode && stylesDisponibles.length > 0 && !styleFinal && nomFinal !== 'autre') {
      setFormError("Veuillez choisir un style pour cet article.");
      return;
    }

    const newItem = { nom: nomFinal, taille: tailleAEnvoyer, couleur, style: styleFinal, quantite: quantiteParsed };

    try {
      console.log('Envoi au backend:', newItem);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem),
      });
      console.log('Réponse du backend:', response.status);

      if (response.ok) {
        alert('Article ajouté/quantité mise à jour !');
        setNom('');
        setTaille('');
        setCouleur('');
        setStyle('');
        setQuantite(0);
        if (typeof onStockAdded === 'function') {
          onStockAdded();
        }
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
      <div className="form-control-stock"> <label>{isTailleRequired ? "Taille*:" : "Taille (Opt):"}</label> <input type="text" value={taille} onChange={e => setTaille(e.target.value)} placeholder={isSacADos ? "Unique" : "S, M, L..."} required={isTailleRequired} list="tailles" disabled={isTailleDisabled} /> <datalist id="tailles"> {taillesSuggereesFinales.map(t => <option key={t} value={t} />)} </datalist> </div>

      <div className="form-control-stock">
        <label>Couleur*:</label>
        <input type="text" value={couleur} onChange={e => setCouleur(e.target.value)} placeholder="Noir, Blanc..." required list="couleurs" disabled={!nom}/>
        <datalist id="couleurs"> {couleursSuggerees.map(c => <option key={c} value={c} />)} </datalist>
      </div>

      <div className="form-control-stock quantity-input"> <label>Qté*:</label> <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} min="0" required disabled={!nom}/> </div>

      <div className="form-control-stock price-display">
        <label>Prix:</label>
        <input type="text" value={prixAffiche !== null ? `${prixAffiche} DZD` : '-'} readOnly disabled />
      </div>

      <button type="submit" className="btn-submit-stock" disabled={!nom}>Ajouter</button>
    </form>
  );
}

// --- Composant Section d'Article par Style ---
function ArticleSection({ articleKey, stockSummaryByVariation, allFilteredDisplayKeys, getSortedKeysForArticle, handleQuantityChange, handleDeleteGroup }) {

    // 1. Logique de filtrage des clés
    const displayedKeysInSection = getSortedKeysForArticle(articleKey).filter(key => allFilteredDisplayKeys.includes(key));

    if (displayedKeysInSection.length === 0) return null;
    const totalArticleQuantity = displayedKeysInSection.reduce((sum, key) => sum + (stockSummaryByVariation[key]?.totalQuantity || 0), 0);

    // 2. Logique de regroupement par style (mémorisé pour cette section)
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
    }, [displayedKeysInSection, stockSummaryByVariation, articleKey]); // Dépendances saines

    return (
        <section key={articleKey} className="article-section">
            <h4 className="article-section-title">
                {articleDetails[articleKey]?.display || 'Autres Articles'}
                <span>({totalArticleQuantity} pcs)</span>
            </h4>

            <div className="article-styles-container">
                {sortedStylesKeys.map(styleKey => (
                    <div key={styleKey} className="style-group">
                        {/* Affichage du titre du style : seulement si plus d'un style ou si article 'Autre' ou si ce n'est pas 'standard' */}
                        {((orderedStyles.length > 1) || articleKey === 'autre' || styleKey !== 'standard') && (
                            <h5 className="style-group-title">
                                {styleKey === 'Autres Variations' ? 'Articles Divers' : styleKey}
                            </h5>
                        )}

                        <div className="stock-summary-grid">
                            {stylesGroups[styleKey]
                                // LOGIQUE DE TRI PAR COULEUR: Noir/Blanc en tête
                                .sort((keyA, keyB) => {
                                    const summaryA = stockSummaryByVariation[keyA];
                                    const summaryB = stockSummaryByVariation[keyB];

                                    const couleurA = (summaryA?.displayCouleur || '').toLowerCase();
                                    const couleurB = (summaryB?.displayCouleur || '').toLowerCase();

                                    // Priorité: 1. Noir, 2. Blanc, 3. Reste alphabétiquement
                                    const getOrder = (couleur) => {
                                        if (couleur === 'noir') return 0;
                                        if (couleur === 'blanc') return 1;
                                        return 2; // Reste
                                    };

                                    const orderA = getOrder(couleurA);
                                    const orderB = getOrder(couleurB);

                                    if (orderA !== orderB) {
                                        return orderA - orderB;
                                    }
                                    // Si même ordre, trier alphabétiquement
                                    return couleurA.localeCompare(couleurB);
                                })
                                .map(key => {
                                    const variationSummary = stockSummaryByVariation[key];
                                    if (!variationSummary) return null;

                                    // --- Logique de construction du titre ---
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
                                    // --- Fin Logique de construction du titre ---

                                    return (
                                        <div key={key} className="article-summary-card">
                                            <h5>
                                                {titleContent}
                                                <span>({variationSummary.totalQuantity} pcs)</span>
                                                <button onClick={() => handleDeleteGroup(variationSummary)} className="btn-delete-group" title="Supprimer tout ce groupe">🗑️</button>
                                            </h5>
                                            <ul className="variation-list size-only-list">
                                                {Object.entries(variationSummary.quantitiesByTaille)
                                                    .filter(([, data]) => data.quantite > 0)
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
      const response = await fetch('http://localhost:3001/api/stock', {
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

  const handleQuantityChange = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/stock/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantite: newQuantity }),
      });
      if (response.ok) {
        fetchStock();
      } else {
        alert('Erreur lors de la mise à jour de la quantité (serveur).');
      }
    } catch (err) { alert('Erreur réseau lors de la mise à jour de la quantité.'); }
  };

  const handleDeleteGroup = async (groupInfo) => {
    let cardTitle = groupInfo.displayNom;
    if (groupInfo.displayStyle && groupInfo.displayStyle !== 'standard' && !groupInfo.displayNom.startsWith('autre-')) { cardTitle += ` - ${groupInfo.displayStyle}`; }
    cardTitle += ` - ${groupInfo.displayCouleur}`;

    const nomKey = Object.keys(articleDetails).find(k => articleDetails[k].display === groupInfo.displayNom) || groupInfo.displayNom;
    const styleKey = (groupInfo.displayStyle === 'standard' || groupInfo.displayStyle === '') ? '' : groupInfo.displayStyle;

    if (!window.confirm(`Es-tu sûr de vouloir supprimer TOUS les articles "${cardTitle}" ?\nCette action est irréversible !`)) { return; }

    const url = `http://localhost:3001/api/stock/group?nom=${encodeURIComponent(nomKey)}&couleur=${encodeURIComponent(groupInfo.displayCouleur)}${styleKey ? `&style=${encodeURIComponent(styleKey)}` : ''}`;

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
        if (!summary[groupKey].quantitiesByTaille[taille]) { summary[groupKey].quantitiesByTaille[taille] = { id: item.id, quantite: 0 }; }
        summary[groupKey].quantitiesByTaille[taille].quantite += itemQuantity;
        summary[groupKey].quantitiesByTaille[taille].id = item.id;
      });
    }

    return { stockSummaryByVariation: summary, totalItemsByCategory: totalsByCategory, totalGlobalQuantity: globalTotalQuantity, totalGlobalValue: globalTotalValue, valueByArticle: valueByArticle };
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
        // Tri d'abord par Style, puis par Couleur
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
  // --- FIN Logique de Filtrage ---


  // --- Formatage Argent ---
  const formatArgent = (nombre) => {
    if (typeof nombre !== 'number' || isNaN(nombre)) { return '0 DZD'; }
    return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';
  };


  // --- RENDER ---
  return (
    <>
      <div className="stock-page-content">
        <div className="stock-page-header">
          <h2>Gestion du Stock</h2>
          <div className="header-actions">

          </div>
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
            {/* 1. Affichage des articles (basé sur les cartes compactes) */}
            {allFilteredDisplayKeys.length > 0 ? (
              <div className="stock-sections-container">
                {/* Appel au composant ArticleSection */}
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

            {/* 2. RÉSUMÉ GLOBAL STATIQUE (Le seul et unique, en bas des cartes) */}

          </div>
        )}

        {/* PANNEAU FLOTTANT EN BAS À DROITE (Conservé pour l'UX compacte) */}
        <div className={`stock-floating-summary ${isSummaryOpen ? 'open' : 'closed'}`}>
          <button className="summary-toggle-btn" onClick={() => setIsSummaryOpen(!isSummaryOpen)}>
          {/* Texte de bascule simple pour le résumé */}
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