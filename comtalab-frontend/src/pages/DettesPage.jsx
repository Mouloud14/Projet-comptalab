// src/pages/DettesPage.jsx (Optimisé pour la rapidité)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './DettesPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTrash } from '@fortawesome/free-solid-svg-icons'; 

// --- Dépendances (doit être cohérent avec le backend) ---
const DEBT_TYPES = ['article', 'euro', 'dtf', 'autre'];
const formatArgent = (nombre) => {
    if (typeof nombre !== 'number' || isNaN(nombre)) { return '0 DZD'; }
    return new Intl.NumberFormat('fr-FR').format(nombre.toFixed(0)) + ' DZD';
};

// Structure des articles (copiée de StockPage pour le formulaire)
const articleDetails = {
    'tshirt': { display: 'T-shirt', styles: ['oversize', 'oversize premium', 'regular', 'enfant'] },
    'hoodie': { display: 'Hoodie', styles: ['premium', 'enfant', 'standard', 'oversize'] },
    'jogging': { display: 'Jogging', styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'] },
    'sac a dos': { display: 'Sac à dos', styles: ['standard', 'premium'] },
    'autre': { display: 'Autre', styles: [] }
};
const articleOrder = Object.keys(articleDetails);

// --- Composant d'ajout de dette ---
function AddDebtForm({ token, onDebtAdded }) {
    const [debtType, setDebtType] = useState('article');
    const [dateOwed, setDateOwed] = useState(new Date().toISOString().slice(0, 10));
    const [amount, setAmount] = useState(''); 
    const [comment, setComment] = useState(''); 
    
    // Pour type 'article'
    const [selectedArticle, setSelectedArticle] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [quantity, setQuantity] = useState(1);

    const [formError, setFormError] = useState('');
    
    // Déductions
    const stylesDisponibles = useMemo(() => (selectedArticle ? articleDetails[selectedArticle]?.styles || [] : []), [selectedArticle]);
    const isArticleMode = debtType === 'article';

    const handleArticleChange = (nom) => {
        setSelectedArticle(nom);
        setSelectedStyle('');
        if (nom === 'sac a dos') { setQuantity(1); } 
    };

    const handleTypeChange = (newType) => {
        setDebtType(newType);
        if (newType !== 'article') { 
            setSelectedArticle(''); 
            setSelectedStyle(''); 
            setQuantity(1); 
        }
        if (newType === 'article') { 
            setAmount(''); 
        } else {
            if (selectedArticle !== 'autre') setAmount(''); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        const contactNameForBackend = 'Fournisseur'; 
        
        if (!dateOwed || !debtType) {
            return setFormError('Le type de dette et la date sont requis.');
        }
        
        let articleJson = null;
        let finalAmount = null;

        if (isArticleMode) {
             if (!selectedArticle || (!selectedStyle && stylesDisponibles.length > 0 && selectedArticle !== 'autre')) {
                 return setFormError('Veuillez spécifier l\'article et le style pour la dette.');
             }
             articleJson = JSON.stringify([{ 
                 nom: selectedArticle, 
                 style: selectedStyle || (selectedArticle === 'autre' ? amount : 'standard'), 
                 quantite: parseInt(quantity) 
             }]);
             finalAmount = 0; // Les dettes d'articles ont un montant de 0 et les détails dans article_json
        } else {
             finalAmount = parseFloat(amount);
             if (isNaN(finalAmount)) {
                 return setFormError('Veuillez saisir un montant valide.');
             }
        }

        const newDebt = {
            contact_name: contactNameForBackend,
            debt_type: debtType,
            amount: finalAmount, // Propriété envoyée au backend pour calcul
            article_json: articleJson,
            date_owed: dateOwed,
            comment: comment 
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dettes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newDebt),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || `Erreur ${response.status}.`);
            }

            // 🚨 NOUVEAU: Appel de la fonction de rafraîchissement avec l'objet complet
            if (typeof onDebtAdded === 'function') {
                // Le backend retourne l'objet dette complet (incluant l'ID et le montant calculé)
                onDebtAdded(responseData); 
            }

            // Réinitialisation du formulaire
            setDebtType('article');
            setAmount('');
            setComment(''); 
            setSelectedArticle('');
            setSelectedStyle('');
            setQuantity(1);
            

        } catch (err) {
            setFormError(`Erreur: ${err.message}`);
        }
    };
    
    return (
        <form className="debt-form horizontal-debt-form" onSubmit={handleSubmit}>
            {formError && <p className="error-message">{formError}</p>}

            <div className="form-fields-inline">
                
                <div className="form-control-debt">
                    <label htmlFor="dateOwed">Date*:</label>
                    <input type="date" id="dateOwed" value={dateOwed} onChange={e => setDateOwed(e.target.value)} required />
                </div>
                
                <div className="form-control-debt">
                    <label htmlFor="debtType">Type*:</label>
                    <select id="debtType" value={debtType} onChange={e => handleTypeChange(e.target.value)} required>
                        {DEBT_TYPES.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                    </select>
                </div>
                
                {isArticleMode ? (
                    <>
                        <div className="form-control-debt article-select">
                            <label htmlFor="selectedArticle">Article*:</label>
                            <select id="selectedArticle" value={selectedArticle} onChange={e => handleArticleChange(e.target.value)} required>
                                <option value="">-- Choisir --</option>
                                {articleOrder.map(n => <option key={n} value={n}>{articleDetails[n].display}</option>)}
                            </select>
                        </div>
                        <div className="form-control-debt style-input">
                            <label htmlFor="selectedStyle">Style/Modèle*:</label>
                            {selectedArticle === 'autre' ? (
                                <input type="text" id="selectedStyle" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Détail de l'article" required/>
                            ) : (
                                <select id="selectedStyle" value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} required={stylesDisponibles.length > 0}>
                                    <option value="">-- Choisir style --</option>
                                    {stylesDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            )}
                        </div>
                        <div className="form-control-debt quantity-input">
                            <label htmlFor="quantity">Qté*:</label>
                            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" required/>
                        </div>
                    </>
                ) : (
                    <div className="form-control-debt amount-input">
                        <label htmlFor="amount">Montant Dû (DZD)*:</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0 DZD" />
                    </div>
                )}

                <div className="form-control-debt comment-input">
                    <label htmlFor="comment">Commentaire:</label>
                    <input type="text" id="comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="Ajouter une note (facultatif)" />
                </div>
            
                <button type="submit" className="btn-submit-debt">Enregistrer</button>
            </div>
            
        </form>
    );
}


// --- Composant Page Dettes Principale ---
function DettesPage({ token }) {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Toujours filtrer sur 'unpaid'
    const fetchDebts = useCallback(async () => {
        setError(null);
        setLoading(true); // Ajout pour s'assurer que le loading s'affiche au début du fetch
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dettes?status=unpaid`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erreur chargement dettes');
            const data = await response.json();
            setDebts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("Impossible de charger les dettes: " + err.message);
            setDebts([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // 🚨 NOUVEAU: Mise à jour locale après l'ajout (appelée par AddDebtForm)
    const handleDebtAddedLocally = useCallback((newDebt) => {
        // Ajout du nouvel élément à l'état local sans re-fetch complet
        setDebts(prevDebts => [newDebt, ...prevDebts]);
    }, []);


    useEffect(() => {
        fetchDebts();
    }, [fetchDebts]);


    // 🚨 OPTIMISATION 1: Mise à jour Optimiste (suppression du re-fetch)
    const handleMarkPaid = async (id) => {
        // 1. Mise à jour Optimiste: retire immédiatement la dette de l'affichage
        setDebts(prevDebts => prevDebts.filter(debt => debt.id !== id));
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dettes/${id}/pay`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) { 
                throw new Error('Erreur marquage payé sur serveur. Restauration de l\'état.');
            }
        } catch (err) {
            alert(`Erreur: ${err.message}`);
            // 2. En cas d'échec, forcer un re-fetch pour restaurer la cohérence (lent, mais sécuritaire)
            fetchDebts(); 
        }
    };
    
    // 🚨 OPTIMISATION 2: Requêtes en parallèle et mise à jour optimiste
    const handlePayAll = async () => {
        if (!window.confirm(`ATTENTION : Voulez-vous vraiment marquer TOUTES les ${debts.length} dettes affichées comme PAYÉES ?`)) return;

        // Optimiste: On vide la liste immédiatement
        const debtsToPay = [...debts];
        setLoading(true);
        setDebts([]); 
        
        // 1. Exécuter toutes les requêtes en parallèle (plus rapide)
        const payPromises = debtsToPay.map(debt => 
            fetch(`${import.meta.env.VITE_API_URL}/api/dettes/${debt.id}/pay`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => ({ ok: res.ok, id: debt.id }))
              .catch(() => ({ ok: false, id: debt.id }))
        );

        const results = await Promise.all(payPromises);
        
        const successCount = results.filter(r => r.ok).length;
        const failCount = results.length - successCount;

        if (failCount === 0) {
            alert(`${successCount} dettes ont été payées avec succès. La liste est à jour.`);
        } else {
            alert(`Opération terminée: ${successCount} payées, ${failCount} échecs.`);
        }
        
        // 2. Finaliser avec un fetch pour assurer la cohérence (récupère les échecs et met à jour le solde)
        fetchDebts(); 
    }

    // 🚨 OPTIMISATION 3: Mise à jour Optimiste (suppression du re-fetch)
    const handleDeleteDebt = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette dette ?")) return;
        
        // 1. Mise à jour Optimiste: retire immédiatement la dette de l'affichage
        setDebts(prevDebts => prevDebts.filter(debt => debt.id !== id));
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dettes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) { 
                throw new Error('Erreur suppression sur serveur. Restauration de l\'état.');
            }
        } catch (err) {
            alert(`Erreur: ${err.message}`);
            // 2. En cas d'échec, forcer un re-fetch pour restaurer la cohérence
            fetchDebts();
        }
    };
    
    // Gère l'affichage des détails pour les dettes d'articles
    const formatArticleDetails = (debt) => {
        if (debt.debt_type !== 'article' || !debt.article_json) return null; // Seulement pour les dettes de type 'article'
        try {
            const articles = JSON.parse(debt.article_json);
            if (!articles.length) return null;
            
            const art = articles[0];
            const qte = art.quantite || 1;
            const styleDisplay = art.style ? `(${art.style})` : ''; 
            return `${qte}x ${art.nom} ${styleDisplay}`;
        } catch (e) {
            return `[Détails article corrompus]`;
        }
    };
    
    // Calcul du Grand Total Dû
    const grandTotalDue = useMemo(() => {
        return debts.reduce((sum, debt) => sum + debt.montant, 0); 
    }, [debts]);


    return (
        <div className="dettes-page-content">
            {/* Le formulaire appelle maintenant handleDebtAddedLocally au lieu de fetchDebts */}
            <AddDebtForm token={token} onDebtAdded={handleDebtAddedLocally} />

            <hr className="stock-divider" />
            
            {/* Entête de Liste avec Total et Bouton Payer Tout */}
            <div className="list-header-dettes">
                <h2>Dettes Actives ({debts.length})</h2>
                <div className="list-actions">
                    <span className="grand-total">
                        Total Dû: <strong className="amount-due">{formatArgent(grandTotalDue)}</strong>
                    </span>
                    <button 
                        onClick={handlePayAll} 
                        className="btn-pay-all" 
                        disabled={debts.length === 0 || loading}>
                        PAYER TOUT ({debts.length})
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Chargement des dettes...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <ul className="dettes-list">
                    {debts.length > 0 ? (
                        debts.map(debt => (
                            <li key={debt.id} className={`debt-item status-unpaid`}>
                                <div className="debt-details">
                                    <span className="debt-type-display"><strong>{debt.debt_type.toUpperCase()}</strong></span>
                                    
                                    {debt.comment && (
                                        <span className="debt-comment-display">{debt.comment}</span>
                                    )}

                                    {debt.debt_type === 'article' && (
                                        <span className="debt-article-details-display">
                                            {formatArticleDetails(debt) || `Article non spécifié`}
                                        </span>
                                    )}
                                </div>

                                <div className="debt-amount-actions">
                                    <span className="debt-amount-due">{formatArgent(debt.montant)}</span> 
                                    <span className="debt-date">Dû le: {debt.date_owed}</span>
                                    
                                    <div className="debt-actions">
                                        <button onClick={() => handleMarkPaid(debt.id)} className="btn-mark-paid" title="Marquer comme payé">
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        </button>
                                        <button onClick={() => handleDeleteDebt(debt.id)} className="btn-delete-debt" title="Supprimer la dette">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="empty-list-message">Toutes les dettes sont payées ! 🎉</p>
                    )}
                </ul>
            )}
        </div>
    );
}

export default DettesPage;