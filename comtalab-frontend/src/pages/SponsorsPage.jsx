import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTrash, 
    faBullhorn, 
    faCalendarAlt, 
    faChartPie,
    faWallet, 
    faCoins,
    faPlus,
    faBox,
    faFilter,
    faArrowTrendUp,
    faArrowTrendDown
} from '@fortawesome/free-solid-svg-icons';
import './SponsorsPage.css';

// Utilitaire de formatage
const formatMoney = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'DZD',
        maximumFractionDigits: 0 
    }).format(amount || 0);
};

const SponsorsPage = ({ token }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalSummary, setGlobalSummary] = useState(null);
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        budget: '',
        startDate: '',
        endDate: ''
    });

    // Filter States
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
    });
    
    const todayString = new Date().toISOString().slice(0, 10);
    
    // --- FETCH DATA ---
    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.startDate) params.append('start_date', filters.startDate);
        if (filters.endDate) params.append('end_date', filters.endDate);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sponsors?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.campaigns);
                setGlobalSummary(data.globalSummary);
            }
        } catch (error) {
            console.error("Erreur chargement sponsors:", error);
        } finally {
            setLoading(false);
        }
    }, [token, filters]);

    useEffect(() => {
        if (token) fetchCampaigns();
    }, [token, filters, fetchCampaigns]);

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSponsor = async (e) => {
        e.preventDefault();
        const { name, budget, startDate, endDate } = formData;
        if (!name || !budget || !startDate || !endDate) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sponsors`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    name, 
                    budget: parseFloat(budget), 
                    start_date: startDate, 
                    end_date: endDate 
                })
            });

            if (response.ok) {
                setFormData({ name: '', budget: '', startDate: '', endDate: '' });
                fetchCampaigns();
            } else {
                alert("Erreur lors de l'ajout.");
            }
        } catch (error) {
            console.error("Erreur ajout:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/sponsors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCampaigns();
        } catch (error) {
            console.error("Erreur suppression:", error);
        }
    };

    // --- COMPUTED DATA ---
    const { activeCampaigns, archivedCampaigns } = useMemo(() => {
        if (!Array.isArray(campaigns)) return { activeCampaigns: [], archivedCampaigns: [] };
        
        const active = [];
        const archived = [];
        
        campaigns.forEach(camp => {
            if (camp.end_date < todayString) {
                archived.push(camp);
            } else {
                active.push(camp);
            }
        });

        return { 
            activeCampaigns: active.sort((a, b) => a.end_date.localeCompare(b.end_date)), 
            archivedCampaigns: archived.sort((a, b) => b.end_date.localeCompare(a.end_date)) 
        };
    }, [campaigns, todayString]);

    const kpiData = globalSummary || { 
        totalBudget: 0, totalDTF: 0, totalVentes: 0, 
        totalCoutArticles: 0, totalLivraison: 0, globalResultatNet: 0 
    };
    
    const caNet = kpiData.totalVentes - kpiData.totalCoutArticles - kpiData.totalLivraison;
    const totalDepenses = kpiData.totalBudget + kpiData.totalDTF;

    // --- RENDER HELPERS ---
    const renderCard = (camp) => {
        const stats = camp.stats || { commandesCount: 0, totalDTF: 0, totalCoutArticles: 0, totalLivraison: 0, totalVentes: 0, resultatNet: -camp.budget };
        const isPositive = stats.resultatNet >= 0;
        const totalOps = stats.totalCoutArticles + stats.totalLivraison;

        return (
            <div key={camp.id} className="sponsor-card">
                <div className="sponsor-card-top">
                    <div className="sponsor-header-info">
                        <h3>{camp.name}</h3>
                        <div className="sponsor-date-badge">
                            <FontAwesomeIcon icon={faCalendarAlt} /> 
                            <span>{camp.start_date} au {camp.end_date}</span>
                        </div>
                    </div>
                    <button onClick={() => handleDelete(camp.id)} className="btn-delete-icon" title="Supprimer">
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>

                <div className="sponsor-body">
                    <div className="stat-row">
                        <div className="stat-group">
                            <span className="stat-label">Commandes</span>
                            <span className="stat-val">
                                <FontAwesomeIcon icon={faBox} style={{color: '#94a3b8', marginRight: 6}}/> 
                                {stats.commandesCount}
                            </span>
                        </div>
                        <div className="stat-group">
                            <span className="stat-label">Budget Pub</span>
                            <span className="stat-val">{formatMoney(camp.budget)}</span>
                        </div>
                    </div>

                    <div className="stat-divider"></div>

                    <div className="stat-details-grid">
                        <div className="detail-item negative">
                            <span className="lbl">Coût DTF</span>
                            <span className="val">- {formatMoney(stats.totalDTF)}</span>
                        </div>
                        <div className="detail-item negative">
                            <span className="lbl">Coûts Ops.</span>
                            <span className="val">- {formatMoney(totalOps)}</span>
                        </div>
                        <div className="detail-item positive">
                            <span className="lbl">Chiffre d'Affaires</span>
                            <span className="val">{formatMoney(stats.totalVentes)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="lbl">Marge Brute</span>
                            <span className="val" style={{color: '#64748b'}}>
                                {formatMoney(stats.totalVentes - totalOps - stats.totalDTF)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`roi-footer ${isPositive ? 'roi-bg-green' : 'roi-bg-red'}`}>
                    <span className="roi-title">RÉSULTAT NET</span>
                    <span className="roi-number">
                        {isPositive && '+'}{formatMoney(stats.resultatNet)}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="sponsors-page-content">
            {/* HEADER AVEC FILTRES COMPACTS */}
            <div className="page-header">
                <div className="header-content">
                    <h2><FontAwesomeIcon icon={faBullhorn} className="text-primary"/> Campagnes & ROI</h2>
                    <p className="subtitle">Analysez la rentabilité de vos investissements publicitaires.</p>
                </div>

                <div className="header-filters" title="Filtrer les statistiques globales">
                    <div className="filter-group-compact">
                        <FontAwesomeIcon icon={faFilter} className="filter-label-icon" />
                    </div>
                    
                    <input 
                        type="date" 
                        className="date-input-compact"
                        value={filters.startDate} 
                        onChange={e => setFilters({...filters, startDate: e.target.value})} 
                    />
                    
                    <span className="separator-text">au</span>
                    
                    <input 
                        type="date" 
                        className="date-input-compact"
                        value={filters.endDate} 
                        onChange={e => setFilters({...filters, endDate: e.target.value})} 
                    />
                </div>
            </div>

            {/* KPI SUMMARY */}
            <div className="kpi-summary-container">
                <div className="kpi-card blue">
                    <div className="kpi-icon"><FontAwesomeIcon icon={faWallet} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Budget Pub. Total</span>
                        <span className="kpi-value">{formatMoney(kpiData.totalBudget)}</span>
                    </div>
                </div>
                <div className="kpi-card orange">
                    <div className="kpi-icon"><FontAwesomeIcon icon={faCoins} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Total Dépenses</span>
                        <span className="kpi-value">{formatMoney(totalDepenses)}</span>
                    </div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon"><FontAwesomeIcon icon={faChartPie} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">Bénéfice Brut</span>
                        <span className="kpi-value">{formatMoney(caNet)}</span>
                    </div>
                </div>
                <div className={`kpi-card ${kpiData.globalResultatNet >= 0 ? 'green' : 'red'}`}>
                    <div className="kpi-icon">
                        <FontAwesomeIcon icon={kpiData.globalResultatNet >= 0 ? faArrowTrendUp : faArrowTrendDown} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Résultat Net Final</span>
                        <span className="kpi-value">{formatMoney(kpiData.globalResultatNet)}</span>
                    </div>
                </div>
            </div>

            {/* FORMULAIRE D'AJOUT */}
            <div className="form-section">
                <h3><FontAwesomeIcon icon={faPlus} className="text-primary"/> Nouvelle Campagne</h3>
                <form className="modern-form" onSubmit={handleAddSponsor}>
                    <div className="input-group">
                        <label>Nom de la Campagne</label>
                        <input name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Ex: Promo Été 2024" required />
                    </div>
                    <div className="input-group">
                        <label>Budget (DZD)</label>
                        <input name="budget" type="number" value={formData.budget} onChange={handleInputChange} placeholder="0.00" required />
                    </div>
                    <div className="input-group">
                        <label>Date Début</label>
                        <input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required />
                    </div>
                    <div className="input-group">
                        <label>Date Fin</label>
                        <input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} required />
                    </div>
                    <button type="submit" className="btn-submit">Lancer la campagne</button>
                </form>
            </div>

            {/* GRILLES DE CAMPAGNES */}
            {loading ? (
                <div style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>Chargement des données...</div>
            ) : (
                <>
                    <div className="section-separator">
                        <h3 className="section-title active">En Cours ({activeCampaigns.length})</h3>
                        <div className="line"></div>
                    </div>
                    <div className="sponsors-grid">
                        {activeCampaigns.length === 0 ? <div className="empty-state">Aucune campagne active.</div> : activeCampaigns.map(renderCard)}
                    </div>
                    
                    <div className="section-separator">
                        <h3 className="section-title">Historique ({archivedCampaigns.length})</h3>
                        <div className="line"></div>
                    </div>
                    <div className="sponsors-grid opacity-dimmed">
                        {archivedCampaigns.length === 0 ? <div className="empty-state">Aucune archive disponible.</div> : archivedCampaigns.map(renderCard)}
                    </div>
                </>
            )}
        </div>
    );
}

export default SponsorsPage;