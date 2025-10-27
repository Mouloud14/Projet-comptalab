// src/pages/StockPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './StockPage.css';

// --- Structure des données articleDetails (inchangée) ---
const articleDetails = {
  't shirt': { display: 'T-shirt', styles: ['oversize', 'oversize premium', 'regular premium', 'regular', 'enfant'], prix: { 'oversize': 950, 'oversize premium': 1150, 'regular premium': 790, 'regular': 620, 'enfant': 620 } },
  'hoodie': { display: 'Hoodie', styles: ['orma premium', 'enfant', 'standard'], prix: { 'orma premium': 1650, 'enfant': 1300, 'standard': 1260 } },
  'jogging': { display: 'Jogging', styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 } },
  'sac a dos': { display: 'Sac à dos', styles: ['standard', 'premium'], prix: { 'standard': 1150, 'premium': 1220 } },
  'autre': { display: 'Autre', styles: [], prix: {} }
};
// --- FIN Structure ---


// --- Composant Formulaire AddStockItemForm (inchangé) ---
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
      console.log('Envoi au backend:', newItem); // Ajout d'un log pour vérifier l'envoi
      const response = await fetch('http://localhost:3001/api/stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem), });
      console.log('Réponse du backend:', response.status); // Ajout d'un log pour voir le statut

      if (response.ok) {
        alert('Article ajouté/quantité mise à jour !');
        setNom(''); setTaille(''); setCouleur(''); setStyle(''); setQuantite(0);
        if (typeof onStockAdded === 'function') { onStockAdded(); }
      } else {
        const errorData = await response.json(); 
        setFormError(errorData.error || `Erreur ${response.status}.`);
        console.error('Erreur backend:', errorData); // Log de l'erreur
      }
    } catch (err) { 
        setFormError('Erreur réseau.'); 
        console.error('Erreur fetch:', err); // Log de l'erreur réseau
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
    // Ne pas remettre loading à true ici si on rafraîchit après ajout/modif
    // setLoading(true); 
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/stock', { cache: 'no-store' });
      if (!response.ok) {
        let errorMsg = `Erreur réseau ou serveur (${response.status})`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch(jsonError) { /* ignore */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setStockItems(Array.isArray(data) ? data : []);
    } catch (err) { 
        setError("Impossible de charger le stock: " + err.message); 
        setStockItems([]); 
    } finally { 
        // Assure que loading passe à false après le premier chargement
        if (loading) setLoading(false); 
    }
  };
  
  // Premier chargement
  useEffect(() => { 
    setLoading(true); // Met loading à true seulement au montage
    fetchStock(); 
  }, []);

  const handleQuantityChange = async (itemId, currentQuantity, change) => {
     const newQuantity = currentQuantity + change;
     if (newQuantity < 0) return;
     try {
       const response = await fetch(`http://localhost:3001/api/stock/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantite: newQuantity }), });
       if (response.ok) {
         // Rafraîchit tout le stock pour être sûr d'avoir la bonne valeur
         // au lieu de juste mettre à jour l'item localement
         fetchStock(); 
         // Original:
         // const updatedData = await response.json();
         // setStockItems(prevItems => Array.isArray(prevItems) ? prevItems.map(item => item.id === updatedData.id ? { ...item, quantite: updatedData.quantite } : item ) : []);
       } else { alert('Erreur MàJ quantité (serveur).'); }
     } catch (err) { alert('Erreur MàJ quantité (réseau).'); console.error(err); }
  };

  const handleDeleteGroup = async (groupInfo) => {
     let cardTitle = groupInfo.displayNom;
     if (groupInfo.displayStyle && groupInfo.displayStyle !== 'standard' && !groupInfo.displayNom.startsWith('autre-')) { cardTitle += ` - ${groupInfo.displayStyle}`; }
     cardTitle += ` - ${groupInfo.displayCouleur}`;
     const nomKey = Object.keys(articleDetails).find(k => articleDetails[k].display === groupInfo.displayNom) || groupInfo.displayNom;
     const styleKey = (groupInfo.displayStyle === 'standard' || groupInfo.displayStyle === '') ? '' : groupInfo.displayStyle; // Correction: 'standard' ou vide = pas de style dans l'URL

     if (!window.confirm(`Es-tu sûr de vouloir supprimer TOUS les articles "${cardTitle}" ?\nAction irréversible !`)) return;

     const url = `http://localhost:3001/api/stock/group?nom=${encodeURIComponent(nomKey)}&couleur=${encodeURIComponent(groupInfo.displayCouleur)}${styleKey ? `&style=${encodeURIComponent(styleKey)}` : ''}`;
     console.log('DELETE Group URL:', url); // Log de l'URL pour débug

     try {
         const response = await fetch(url, { method: 'DELETE' });
         if (response.ok || response.status === 404) {
             alert(`Groupe "${cardTitle}" supprimé.`);
             fetchStock(); // Recharger tout le stock
         } else {
             const errorData = await response.json();
             alert(`Erreur suppression groupe: ${errorData.error || response.status}`);
             console.error('Erreur DELETE Group:', errorData);
         }
     } catch (err) {
         alert('Erreur réseau suppression groupe.');
         console.error('Erreur fetch DELETE Group:', err);
     }
  };


  // --- LOGIQUE POUR LES CARTES ET LE RÉSUMÉ GLOBAL (CORRIGÉE useMemo) ---
  const { stockSummaryByVariation, totalItemsByCategory, totalGlobalQuantity, totalGlobalValue, valueByArticle } = useMemo(() => {
    // Toujours initialiser les variables
    let summary = {};
    let totalsByCategory = {}; 
    let valueByArticle = {};
    let globalTotalQuantity = 0;
    let globalTotalValue = 0; 

    // Traiter seulement si stockItems est un array (même vide)
    if (Array.isArray(stockItems)) {
        stockItems.forEach(item => {
            // Assurer que quantite est un nombre
            const itemQuantity = Number(item.quantite) || 0;
            if (isNaN(itemQuantity)) {
                console.warn(`Item ID ${item.id} a une quantité invalide:`, item.quantite);
                return; // Ignore cet item s'il a une quantité non numérique
            }

            const baseKey = Object.keys(articleDetails).find(key => key === item.nom) || 'autre';
            const couleur = item.couleur || 'Inconnue';
            let groupKey = ''; let displayNom = ''; let displayStyle = item.style || 'standard'; let displayCouleur = couleur;

            if (baseKey === 'autre') {
                const customNom = item.nom === 'autre' ? item.style || `Inconnu ID ${item.id}` : item.nom;
                groupKey = `autre-${customNom}-${couleur}`; displayNom = customNom; displayStyle = ''; // Pas de style pour 'autre'
            } else {
                groupKey = `${item.nom}-${displayStyle}-${couleur}`; displayNom = articleDetails[baseKey]?.display || item.nom;
            }

            if (!summary[groupKey]) { summary[groupKey] = { displayNom, displayStyle, displayCouleur, totalQuantity: 0, quantitiesByTaille: {} }; }

            let unitPrice = 0;
            if (baseKey !== 'autre') { // Pas de prix auto pour 'autre'
                const styleToLook = item.style || 'standard'; // 'standard' pour hoodies sans style specifique
                const articleData = articleDetails[baseKey];
                
                // Vérifie si articleData, .prix, et la clé de style existent
                if (articleData && articleData.prix && typeof articleData.prix[styleToLook] === 'number') { 
                    unitPrice = articleData.prix[styleToLook];
                } else if (articleData && articleData.prix && styleToLook === 'standard' && typeof articleData.prix['standard'] === 'number') {
                    // Fallback pour 'standard' si le style spécifique n'a pas de prix défini (ex: hoodie standard)
                     unitPrice = articleData.prix['standard'];
                }
                
                // Cas spécial hoodie enfant taille adulte
                if (baseKey === 'hoodie' && item.style === 'enfant' && ['S', 'M', 'L', 'XL', 'XXL'].includes((item.taille || '').toUpperCase())) { 
                    unitPrice = 1650; 
                }
            }
            const variationValue = unitPrice * itemQuantity;

            summary[groupKey].totalQuantity += itemQuantity;
            globalTotalQuantity += itemQuantity;
            globalTotalValue += variationValue; 

            const articleDisplayName = articleDetails[baseKey]?.display || displayNom; // Utilise displayNom pour 'autre'
            
            totalsByCategory[articleDisplayName] = (totalsByCategory[articleDisplayName] || 0) + itemQuantity;
            valueByArticle[articleDisplayName] = (valueByArticle[articleDisplayName] || 0) + variationValue;

            const taille = item.taille || 'Unique';
            // Crée l'entrée taille si elle n'existe pas
            if (!summary[groupKey].quantitiesByTaille[taille]) {
                 summary[groupKey].quantitiesByTaille[taille] = { id: item.id, quantite: 0 };
            }
            // Met à jour la quantité pour cette taille (même si plusieurs lignes DB ont la même taille)
            summary[groupKey].quantitiesByTaille[taille].quantite += itemQuantity;
            // Garde l'ID du dernier item rencontré pour cette taille (pour les boutons +/-)
            summary[groupKey].quantitiesByTaille[taille].id = item.id; 
        });
    } else {
        // Si stockItems n'est pas un array (ne devrait pas arriver avec useState([]))
        console.error("stockItems n'est pas un array:", stockItems);
    }

    // Retourne toujours l'objet complet
    return { 
        stockSummaryByVariation: summary, 
        totalItemsByCategory: totalsByCategory, 
        totalGlobalQuantity: globalTotalQuantity, 
        totalGlobalValue: globalTotalValue, 
        valueByArticle: valueByArticle 
    };
  }, [stockItems]); // Dépend uniquement de stockItems
  // --- FIN LOGIQUE CARTES ET VALEUR ---


  // --- Fonctions de Tri et Filtrage (inchangées) ---
  const articleOrder = ['t shirt', 'hoodie', 'jogging', 'sac a dos', 'autre'];

  const getSortedKeysForArticle = (articleBaseKey) => {
      return Object.keys(stockSummaryByVariation)
          .filter(key => {
              if (articleBaseKey === 'autre') { return key.startsWith('autre-'); }
              // Gère les cas où item.nom n'est pas dans articleDetails (considéré comme 'autre')
              const baseItemKey = key.split('-')[0];
              const isInDetails = Object.keys(articleDetails).includes(baseItemKey);
              if (articleBaseKey === 'autre') return !isInDetails || key.startsWith('autre-');
              return key.startsWith(`${articleBaseKey}-`);
          })
          .filter(key => stockSummaryByVariation[key]?.totalQuantity > 0) // Filtre quantité > 0
          .sort((keyA, keyB) => { // Tri: Style puis Couleur
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
      .filter(key => stockSummaryByVariation[key]?.totalQuantity > 0) // Uniquement ceux avec stock > 0
      .filter(key => { // Filtre par catégorie (articleFilter)
          const baseItemKey = key.split('-')[0];
          const isInDetails = Object.keys(articleDetails).includes(baseItemKey);
          
          if (articleFilter === 'all') return true;
          if (articleFilter === 'autre') return !isInDetails || key.startsWith('autre-');
          return key.startsWith(`${articleFilter}-`);
      })
      .filter(key => { // Filtre par terme de recherche
          if (term === '') return true;
          const summary = stockSummaryByVariation[key];
          if (!summary) return false;

          // Construit le titre complet pour la recherche
          let cardTitle = summary.displayNom;
          if (summary.displayStyle && summary.displayStyle !== 'standard' && !key.startsWith('autre-')) { 
              cardTitle += ` ${summary.displayStyle}`; 
          }
          cardTitle += ` ${summary.displayCouleur}`;
          
          // Recherche dans le titre
          if (cardTitle.toLowerCase().includes(term)) return true;
          
          // Recherche dans les tailles
          const hasMatchingTaille = Object.keys(summary.quantitiesByTaille)
              .some( taille => taille.toLowerCase().includes(term) );
          if (hasMatchingTaille) return true;
          
          return false; // Non trouvé
      })
      .sort((keyA, keyB) => { // Tri final pour l'affichage
          const summaryA = stockSummaryByVariation[keyA];
          const summaryB = stockSummaryByVariation[keyB];
          
          const baseKeyA = keyA.split('-')[0];
          const baseKeyB = keyB.split('-')[0];

          const indexA = articleOrder.indexOf(baseKeyA === 'autre' ? 'autre' : baseKeyA);
          const indexB = articleOrder.indexOf(baseKeyB === 'autre' ? 'autre' : baseKeyB);
          
          const effectiveIndexA = indexA === -1 ? articleOrder.indexOf('autre') : indexA; 
          const effectiveIndexB = indexB === -1 ? articleOrder.indexOf('autre') : indexB;

          // 1. Tri par Ordre d'Article Principal
          if (effectiveIndexA !== effectiveIndexB) { return effectiveIndexA - effectiveIndexB; }
          
          // 2. Tri par Nom (si 'autre')
          if (baseKeyA === 'autre' && baseKeyB === 'autre') {
               const nameCompare = (summaryA?.displayNom || '').localeCompare(summaryB?.displayNom || '');
               if (nameCompare !== 0) return nameCompare;
          }
          
          // 3. Tri par Style (si applicable)
          const styleCompare = (summaryA?.displayStyle || '').localeCompare(summaryB?.displayStyle || '');
          if (styleCompare !== 0) return styleCompare;
          
          // 4. Tri par Couleur
          return (summaryA?.displayCouleur || '').localeCompare(summaryB?.displayCouleur || '');
      });
  }, [stockSummaryByVariation, articleFilter, searchTerm]);
  // --- FIN LOGIQUE FILTRAGE ---


  // --- Formatage Argent (inchangé) ---
  const formatArgent = (nombre) => {
      if (typeof nombre !== 'number' || isNaN(nombre)) {
          return '0 DZD'; // Retourne 0 si l'entrée n'est pas un nombre valide
      }
      return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';
  };
  // --- FIN Formatage ---


  // --- RENDER ---
  return (
    <div className="stock-page-content">
      <h2>Gestion du Stock</h2>
      <AddStockItemForm onStockAdded={fetchStock} />
      <hr className="stock-divider"/>

      <div className="stock-filters">
        <input type="text" placeholder="Rechercher par nom, style, couleur, taille..." className="filter-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="filter-article-select" value={articleFilter} onChange={(e) => setArticleFilter(e.target.value)}>
          <option value="all">Tous les articles</option>
          {articleOrder.map(key => ( <option key={key} value={key}>{articleDetails[key]?.display || key}</option> ))}
        </select>
      </div>
      
      <h3>Récapitulatif Détaillé du Stock</h3>

      {/* --- Affichage Chargement / Erreur / Contenu --- */}
      {loading ? (
        <p>Chargement du stock...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="stock-content-wrapper">
          {/* Vérifie s'il y a des clés à afficher après filtrage */}
          {filteredDisplayKeys.length > 0 ? (
             <div className="stock-sections-container">
                {/* Structure par section d'article */}
                {articleOrder.map(articleKey => {
                    // Récupère les clés triées pour cette section d'article
                    const variationKeys = getSortedKeysForArticle(articleKey);
                    // Garde seulement celles qui passent les filtres globaux
                    const displayedKeysInSection = variationKeys.filter(key => filteredDisplayKeys.includes(key));
                    
                    if (displayedKeysInSection.length === 0) return null; // Ne rend pas la section si vide après filtrage

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
                                    .filter(([_, data]) => data.quantite > 0) // Affiche seulement si qté > 0
                                    .sort(([tailleA], [tailleB]) => { // Tri des tailles
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
                                    {/* Message si qté totale > 0 mais toutes les tailles sont à 0 (ne devrait pas arriver avec le filtre .filter(([_, data]) => data.quantite > 0)) */}
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
              // Message si aucun résultat après filtrage/recherche
              <p className="empty-summary-message">Aucun article ne correspond à votre recherche ou filtre.</p>
          )}

          {/* --- Section Récapitulatif Global (toujours affichée si pas d'erreur) --- */}
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
                    {Object.keys(totalItemsByCategory).length === 0 && <p className='empty-summary-message'>Aucun article en stock.</p>}
              </div>
          </div>
          {/* --- FIN Section Récap Global --- */}
        </div> // Fin stock-content-wrapper
      )} 
      {/* --- FIN Affichage --- */}
    </div> // Fin stock-page-content
  );
}

export default StockPage;